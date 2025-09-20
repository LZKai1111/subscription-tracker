import { Router } from 'express';
import authorize from '../middlewares/auth.middleware.js'
import { cancelSubscription, createSubscription, deleteSubscription, getAllSubscription, getSubscription, getUserSubscription, upcomingRenewals, updateSubscription } from '../controllers/subscription.controller.js';

const subscriptionRouter = Router();


// express checks routes by the order they are defined. upcoming renewal keeps giving error as /:id will match any string after /subscriptions, including 'upcoming-renewals'
// thus, 'upcoming-renewal' is never reached because '/:id' reaches it first.
// simple solution is to put static routes above dynamic routes.
// or use more specific dynamic route such as /by-id/:id

subscriptionRouter.get('/upcoming-renewals', upcomingRenewals);

subscriptionRouter.get('/', getAllSubscription);

subscriptionRouter.get('/:id', getSubscription);

subscriptionRouter.post('/', authorize, createSubscription);

subscriptionRouter.put('/:id', authorize, updateSubscription);

subscriptionRouter.delete('/:id', deleteSubscription);

subscriptionRouter.get('/user/:id', authorize, getUserSubscription);

subscriptionRouter.put('/:id/cancel', cancelSubscription);



export default subscriptionRouter;  