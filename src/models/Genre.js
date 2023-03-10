const { DataTypes, UUIDV4 } = require('sequelize');
// Exportamos una funcion que define el modelo
// Luego le injectamos la conexion a sequelize.
module.exports = (sequelize) => {
  // defino el modelo
  sequelize.define('genre', {
    ID: {
        type: DataTypes.UUID,
        defaultValue: UUIDV4,         
        Unique: true,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        // defaultValue: 'NoGenresSpecified',
        // allowNull: false,
      },
},
{
  timestamps: false
});
};
