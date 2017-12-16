'use strict';

module.exports = function (sequelize, dataTypes) {
  const CampusCourseClass = sequelize.define('campusCourseClass', {
    id: {
      type: dataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    }
  }, {
    tableName: 'campus_course_class',
    timestamp: true,
    collate: 'utf8_unicode_ci',
    indexes: []
  });

  CampusCourseClass.associate = function (models) {
    this.belongsTo(models.courseClass);
    this.belongsTo(models.campusCourse);
  };

  return CampusCourseClass;
};
