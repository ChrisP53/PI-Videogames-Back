const { DataTypes, UUIDV4 } = require('sequelize');
// Exportamos una funcion que define el modelo
// Luego le injectamos la conexion a sequelize.
module.exports = (sequelize) => {
  // defino el modelo
  sequelize.define('platform', {
    platformID: {
       type: DataTypes.INTEGER,
        // type: DataTypes.UUID,
        // defaultValue: UUIDV4,
        Unique: true,
        primaryKey: true,
        allowNull: false,
      },
      platformName: {
        type: DataTypes.STRING,        
        allowNull: false,
      },
},
{
  timestamps: false
});
};