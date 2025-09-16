import dayjs from 'dayjs';
import Subscription from '../models/subscription.model.js';

// upstash is written by commonjs, needs to use require to import it 
// in package.json, type: 'module' means we can only have imports
// the way to go around is as below
import { createRequire } from 'module';
import { sendReminderEmail } from '../utils/send-email.js';
const require = createRequire(import.meta.url);
const { serve } = require('@upstash/workflow/express');

const REMINDERS = [7, 5, 2, 1];

export const sendReminders = serve( async (context) => {
    const { subscriptionId } = context.requestPayload;
    const subscription = await fetchSubscription(context, subscriptionId);

    if(!subscription || subscription.status != 'active') return;

    const renewalDate = dayjs(subscription.renewalDate);

    if(renewalDate.isBefore(dayjs())){
        console.log(`Renewal date has passed for subscription ${subscriptionId}. Stopping workflow.`)
        return;
    }

    for (const daysBefore of REMINDERS) {
        const reminderDate = renewalDate.subtract(daysBefore, 'day');
        // renewal date = 22 feb, reminder date: 15 feb, 17, 20, 21

        if(reminderDate.isAfter(dayjs())){
            await sleepUntilReminder(context, `Reminder ${daysBefore} days before`, reminderDate)
        }

        if(dayjs().isSame(reminderDate, 'day')) {
            await triggerReminder(context, `${daysBefore} days before reminder`, subscription, );
        }

    }
});


// double return keywords as function returns undefined if you dont explicitly return something
const fetchSubscription = async (context, subscriptionId) => {
    return await context.run('get subscription', async () => {
        return Subscription.findById(subscriptionId).populate( 'user', 'name email' );
    })
}


const sleepUntilReminder = async(context, label, date) => {
    console.log(`Sleeping until ${label} reminder at ${date}`);
    await context.sleepUntil(label, date.toDate());
}


const triggerReminder = async ( context, label, subscription ) => {
    return await context.run(label, async () => {
        console.log(`Triggering ${label} reminder`);
        // send email, SMS, push notification... or any custom logic
        await sendReminderEmail({
            to: subscription.user.email,
            type: label,
            subscription,
        })
    })
}