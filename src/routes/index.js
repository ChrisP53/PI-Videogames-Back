const { Router } = require("express");
const axios = require("axios");
const { Videogame, Genre, Platform } = require("../db");
const db = require("../db");
// Importar todos los routers;
// Ejemplo: const authRouter = require('./auth.js');

const {
  API_KEY
} = process.env;

const router = Router();
router.use(require("body-parser").json());

// Configurar los routers
// Ejemplo: router.use('/auth', authRouter);

const getDbData = async () => {  
  const fromDB = await Videogame.findAll({
    include: [
      {
        model: Genre,
        // required: false,
        genres: ["name"],
        through: {
          genres: [],
        },
      },
      {
        model: Platform,
        // required: false,
        platforms: ["platformName"],
        through: {
          platforms: [],
        },
      },
    ],
  });

  const restructuredDB = fromDB.map((gameDB) => {
    return {
      ID: gameDB.ID,
      name: gameDB.name,
      description: gameDB.description,
      releaseDate: gameDB.releaseDate,
      rating: gameDB.rating,
      genres: gameDB.genres.map((genre) => {
        return genre.name;
      }),
      platforms: gameDB.platforms.map((platform) => {
        return platform.platformName;
      }),
    };
  });  
  return restructuredDB;
};

router.get("/videogames", async (req, res) => {
  const name = req.query.name;
  const dbData = await getDbData();  
  try {
    if (name) {
      const gamesInDb = [];
      const results = [];
      await dbData.map((g) => {
        console.log(g.name.toLowerCase().trim())
        console.log(name.toLowerCase().trim())
        if (g.name.toLowerCase().trim().includes(name.toLowerCase().trim())) {          
          gamesInDb.push(g)
        }
      });      
      console.log(dbData);
      console.log(results)      
      if (false) {
        return res.status(200).send(results);
      } else {        
        var getGameFromApi = await axios.get(
          `https://api.rawg.io/api/games?search=${name}?&key=${API_KEY}`
        );
        var gameResults = getGameFromApi.data.results;        
        for (let i = 0; i < gameResults.length; i++) {
          //DO NOT CHANGE THIS
          results.push({
            ID: gameResults[i].id,
            name: gameResults[i].name,
            img: gameResults[i].background_image,
            genres: gameResults[i].genres.map((genre) => {
              return genre.name;
            }),
            //DESCRIPTION WHERE DESCRIPTION WHERE DESCRIPTION WHERE DESCRIPTION WHERE
            rating: gameResults[i].rating,
            releaseDate: gameResults[i].released,
            platforms: gameResults[i].platforms.map((p) => {
              return p.platform.name;
            }),
          });
        }        
        return res.status(200).send([...gamesInDb, ...results]);
      }
    }
  } catch (error) {
    {
      return res.status(404).send("Game not found :(" + error);
    }
  }

  const links = []
  for (let i = 1; i <= 5; i++) {
    console.log(links.length)
    if (!links.length) links.push(`https://api.rawg.io/api/games?key=${API_KEY}`)
    else {
      links.push(`https://api.rawg.io/api/games?key=${API_KEY}&page=${i}`)
    }
  }
  console.log(links);
  
  const getApi = await axios.all(links.map((l)=>axios.get(l)))  
  
  var apiInfo = getApi.map((g)=>g.data.results);
  var apiInfo = [...apiInfo[0], ...apiInfo[1], ...apiInfo[2], ...apiInfo[3], ...apiInfo[4]]
  // console.log(apiInfo)
  const everyGameInApi = apiInfo.map((game) => {
    return {
      ID: game.id,
      name: game.name,
      img: game.background_image,
      genres: game.genres.map((genre) => {
        return genre.name;
      }),
      rating: game.rating,
      releaseDate: game.releaseDate,
      platforms: game.platforms.map((p) => {
        return p.platform.name;
      }),
    };
  });
  console.log(await getDbData());
  res.status(200).send(dbData.concat(everyGameInApi));
});

router.get("/videogames/:id", async (req, res) => {
  const id = req.params.id;
  var dbData = await getDbData();
  var gameFoundInDB = await dbData.filter((game) => game.ID === id);
  if (gameFoundInDB.length > 0) {
    return res.status(200).json(gameFoundInDB[0]);
  } else {
    try {
      const getApi = await axios.get(
        `https://api.rawg.io/api/games/${id}?&key=${API_KEY}`
      );
      const apiData = getApi.data;
      const reqGame = {
        ID: apiData.id,
        name: apiData.name,
        img: apiData.background_image,
        genres: apiData.genres.map((genre) => {
          return genre.name;
        }),
        description: apiData.description,
        rating: apiData.rating,
        releaseDate: apiData.released,
        platforms: apiData.platforms.map((p) => {
          return p.platform.name;
        }),
      };
      return res.status(200).json(reqGame);
    } catch (error) {
      return res.status(400).json("Something got wrong. " + error);
    }
  }
});

router.get("/genres", async (req, res) => {
  try {
    const getApi = await axios.get(
      `https://api.rawg.io/api/genres?&key=${API_KEY}`
    );
    const apiInfo = getApi.data.results;
    const genres = apiInfo.map((genre) => {
      return {
        name: genre.name,
      };
    });
    genres.map((g) => {
      Genre.findOrCreate({
        where: {
          name: g.name,
        },
      });
    });
    const genresFromDb = await Genre.findAll();
    return res.status(200).json(genresFromDb);
  } catch (error) {
    return res.status(400).json(error);
  }
});

router.get("/platforms", async (req, res) => {

  try {
    const getApi = await axios.get(
      `https://api.rawg.io/api/platforms?key=${API_KEY}`
    );
  
    const apiInfo = getApi.data.results;
      const platforms = apiInfo.map((p) => {
        return {      
          platformID: p.id,
          platformName: p.name,
        }       
    })
  
    platforms.map((p) => {
      Platform.findOrCreate({
        where: {
          platformID: p.platformID,
          platformName: p.platformName,
        },
      })
    })
  
    const platformsFromDB = await Platform.findAll();

    return res.status(200).send(platformsFromDB);
  } catch (error) {
    return res.status(400).send(error)
  }  
});

router.post("/videogames", async (req, res) => {
  const { name, description, releaseDate, rating, genres, platforms } = req.body;

  const createdGame = await Videogame.create({
    name,
    description,
    releaseDate,
    rating,
  });

  const getGenres = await Genre.findAll({
    where: {
      name: genres,
    },
  });
  const getPlatforms = await Platform.findAll({
    where: {
      platformName: platforms,
    },
  });
  await createdGame.addGenre(getGenres);
  await createdGame.addPlatforms(getPlatforms);
  console.log(getPlatforms)
  return res.status(201).json(createdGame);
});

 // router.get("/adventure", async (req, res) => {
 //   const DB = await getDbData()
 //   const filterd = DB.filter((g)=>g.genres.includes("Adventure") )
 //   res.status(200).send(filterd)
 // })

module.exports = router;
