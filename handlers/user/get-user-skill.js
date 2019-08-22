/*eslint-disable max-len*/
'use strict';

/**
 * Basically this feature is getting the post of current
 * Log-in user from the home and community menu
 */

const lib = require('../../lib');

/**
 * Validation of req.body, req, param,
 * and req.query
 * @param {any} req request object
 * @param {any} res response object
 * @param {any} next next object
 * @returns {next} returns the next handler - success response
 * @returns {rpc} returns the validation error - failed response
 */
function validateParams (req, res, next) {
  let paramsSchema = {
    offset: {
      optional: true,
      isInt: {
        errorMessage: 'Invalid Resource: Offset'
      }
    },
    limit: {
      optional: true,
      isInt: {
        errorMessage: 'Invalid Resource: Limit'
      }
    },
    userId: {
      optional: true,
      isInt: {
        errorMessage: 'Invalid Resource: User Id'
      }
    }
  };

  req.checkParams(paramsSchema);
  return req.getValidationResult()
  .then(validationErrors => {
    if (validationErrors.array().length !== 0) {
      return res.status(400)
      .send(new lib.rpc.ValidationError(validationErrors.array()));
    }

    return next();
  })
  .catch(error => {
    res.status(500)
    .send(new lib.rpc.InternalError(error));
  });
}

function getSkills (req, res, next) {
  /**
   * Basically check if we have req.$params.userId
   * if we are getting timeline of a certain user
   * or getting the timeline of particular userId
   */
  let userId = req.$params.userId || req.$scope.user.id;
  let offset = lib.utils.returnValue(req.$params.offset);
  let limit = lib.utils.returnValue(req.$params.limit);
  
  let user = req.$scope.user;

  return req.db.userSkill.findAll({
    include: [{
      model: req.db.skill,
      as: 'skill'
    }],
    where: {
        userId: {
            [req.Op.eq]: userId
        }
    },
    order: [['createdAt', 'DESC']],
    subQuery: false,
    offset: !offset ? 0 : parseInt(offset),
    limit: !limit ? 10 : parseInt(limit)
  })
  .then((skills) => {
    let body = {
        status: 'SUCCESS',
        status_code: 0,
        http_code: 200,
        data: skills
    };
    
    res.status(200).send(body);
  })
  .catch(error => {
    res.status(500)
    .send(new lib.rpc.InternalError(error));

    req.log.error({
      err: error.message
    }, 'post.findAll Error - get-user-timeline');
  });
}

module.exports.validateParams = validateParams;
module.exports.logic = getSkills;