import { BeforeChangeHook } from 'payload/dist/collections/config/types';

export const populateCreatedBy: BeforeChangeHook = ({ req, data, operation }) => {
  if (operation === 'create') {
    if (req.user) {
      data.createdBy = req.user.id;
      return data;
    }
  }
  return data;
};