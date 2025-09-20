import { workflowClient } from '../config/upstash.js';
import Subscription from '../models/subscription.model.js'
import { SERVER_URL } from '../config/env.js';
import dayjs from 'dayjs';

export const createSubscription = async (req, res, next) => {
    try{
        const subscription = await Subscription.create({
            ...req.body,
            user: req.user._id,
        });

        const { workflowRunId } = await workflowClient.trigger({
            url: `${SERVER_URL}/api/v1/workflows/subscription/reminder`,
            body: {
                subscriptionId: subscription.id,
            },
            headers: {
                'content-type': 'application/json',
            },
            retries: 0,
        })

        res.status(201).json({ success: true, data: { subscription, workflowRunId } })
    } catch (e) {
        next(e);
    }
}

export const getUserSubscription = async (req, res, next) => {
    try {
        // Check if user is the same as the one in the token
        if(req.user.id != req.params.id) {
            const error = new Error('You are not the owner of the account');
            error.status = 401;
            throw error;
        }

        const subscriptions = await Subscription.find({ user: req.params.id });

        res.status(200).json({ success: true, data: subscriptions });
    } catch (e) {
        next(e);
    }
}

export const getAllSubscription = async (req, res, next) => {
    try {
        const subscriptions = await Subscription.find();
        
        res.status(200).json({ success: true, data: subscriptions });
    } catch (e) {
        next(e);
    }
}

export const getSubscription = async ( req, res, next ) => {
    try {
        const subscription = await Subscription.find({ user: req.params.id });

        res.status(200).json({ success: true, data: subscription })
    } catch (e) {
        next(e);
    }
}

export const updateSubscription = async ( req, res, next ) => {
    try {
        const subscription = await Subscription.findByIdAndUpdate( req.params.id, req.body );

        res.status(200).json({ success: true, data: subscription })
    } catch (e) {
        next(e);
    }
}


export const deleteSubscription = async ( req, res, next ) => {
    try {
        const subscription = await Subscription.findByIdAndDelete( req.params.id );

        res.status(200).json({ success: true, data: subscription })
    } catch (e) {
        next(e);
    }
}


export const cancelSubscription = async ( req, res, next ) => {
    try {
        const { status } = req.body;
        
        if(!['active', 'cancelled'].includes(status)) {
            return res.status(400).json({ error: "Invalid status value" });
        }

        const subscription = await Subscription.findByIdAndUpdate( req.params.id, {status} );

        res.status(200).json({ success: true, data: subscription });
        

    } catch (e) {
        next(e);
    }
}


export const upcomingRenewals = async ( req, res, next ) => {
    try {
        const today = dayjs();
        const oneMonthLater = dayjs().add(1, 'Month').endOf("day").toDate();

        const subscriptions = await Subscription.find({ renewalDate: { $gte: today, $lte: oneMonthLater }});

        res.status(200).json({ success: true, data: subscriptions });

    } catch (e) {
        next(e);
    }
}


