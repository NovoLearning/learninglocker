import getAuthFromRequest from 'lib/helpers/getAuthFromRequest';
import catchErrors from 'api/controllers/utils/catchErrors';
import getScopeFilter from 'lib/services/auth/filters/getScopeFilter';
import { generateQueryBuilderCaches } from 'lib/services/querybuildercache';
import Statement, { mapDot } from 'lib/models/statement';
import encodeDot from 'lib/helpers/encodeDot';
import mongoose from 'mongoose';
import { mapKeys } from 'lodash';

const objectId = mongoose.Types.ObjectId;

export const patchStatementMetadata = catchErrors(async (req, res) => {
  const authInfo = getAuthFromRequest(req);

  const scopeFilter = await getScopeFilter({
    modelName: 'statement',
    actionName: 'edit',
    authInfo
  });

  const filter = {
    $and: [
      { _id: objectId(req.params.id) },
      scopeFilter
    ]
  };

  const metadata = mapDot(req.body, encodeDot);
  const model = await Statement.findOneAndUpdate(filter, {
    $set: mapKeys(metadata, (_value, key) => `metadata.${key}`)
  }, { new: true, fields: { _id: 1, organisation: 1, metadata: 1 } });
  generateQueryBuilderCaches({ metadata }, model.organisation);

  return res.status(200).send(mapDot({ _id: model._id, metadata: model.metadata }));
});

export const postStatementMetadata = catchErrors(async (req, res) => {
  const authInfo = getAuthFromRequest(req);

  const scopeFilter = await getScopeFilter({
    modelName: 'statement',
    actionName: 'edit',
    authInfo
  });

  const filter = {
    $and: [
      { _id: objectId(req.params.id) },
      scopeFilter
    ]
  };
  const metadata = mapDot(req.body, encodeDot);

  const update = { metadata };
  const model = await Statement.findOneAndUpdate(filter, update, { new: true, fields: { _id: 1, organisation: 1, metadata: 1 } });
  generateQueryBuilderCaches(update, model.organisation);

  return res.status(200).send(mapDot({ _id: model._id, metadata: model.metadata }));
});

export default {
  patchStatementMetadata,
  postStatementMetadata
};
