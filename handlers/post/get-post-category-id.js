'use strict';

/**
 * @author Jo-Ries Canino
 * @description Get Post Category Id
 * Basically Right now we have 2 Categories
 * post
 * story
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
  let headerSchema = {
    token: {
      notEmpty: {
        errorMessage: 'Missing Resource: Token'
      }
    }
  };

  req.checkHeaders(headerSchema);
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

function getPostCategoryId (req, res, next) {
  let categoryCode = req.$params.categoryCode;

  return req.db.postCategory.findOne({
    where: {
      code: {
        [req.Op.eq]: categoryCode
      }
    }
  })
  .then(postCategory => {
    if (!postCategory) {
      return res.status(400).send({
        status: 'ERROR',
        status_code: 102,
        status_message: 'Invalid Resource: Post Category Code',
        http_code: 400
      });
    }

    req.$scope.postCategory = postCategory;
    next();
    return postCategory;
  })
  .catch(error => {
    res.status(500)
    .send(new lib.rpc.InternalError(error));

    req.log.error({
      err: error
    }, 'postRating.findAll Error - get-post-category-id');
  });
}

/**
 * Response data to client
 * @param {any} req request object
 * @param {any} res response object
 * @returns {any} body response object
 */
function response (req, res) {
  let postCategory = req.$scope.postCategory;
  let body = {
    status: 'SUCCESS',
    status_code: 0,
    http_code: 200,
    postCategoryId: postCategory.id
  };

  res.status(200).send(body);
}

module.exports.validateParams = validateParams;
module.exports.logic = getPostCategoryId;
module.exports.response = response;