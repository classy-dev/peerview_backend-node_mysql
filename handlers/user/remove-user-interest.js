'use strict';

/**
 * @author Jo-Ries Canino
 * @description Remove User Interest
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
    interestId: {
      notEmpty: {
        errorMessage: 'Missing Resource: Interest Id Params'
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

function removeUserInterest (req, res, next) {
  let user = req.$scope.user;
  let interestId = req.$params.interestId;

  return req.db.userInterest.destroy({
    where: {
      [req.Op.and]: {
        userId: user.id,
        interestId: interestId
      }
    }
  })
  .then(userInterest => {
    next();
    return userInterest;
  })
  .catch(error => {
    res.status(500)
    .send(new lib.rpc.InternalError(error));

    req.log.error({
      err: error.message
    }, 'userInterest.destroy Error - remove-user-interest');
  });
}

/**
 * Response data to client
 * @param {any} req request object
 * @param {any} res response object
 * @returns {any} body response object
 */
function response (req, res) {
  let body = {
    status: 'SUCCESS',
    status_code: 0,
    http_code: 200
  };

  res.status(200).send(body);
}

module.exports.validateParams = validateParams;
module.exports.logic = removeUserInterest;
module.exports.response = response;
