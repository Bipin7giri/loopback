import {HttpErrors} from '@loopback/rest';
import axios from 'axios';

export async function handleNofication(notificationPayload: any) {
  try {
    const headers = {
      'Content-Type': 'application/json',
      Authorization:
        'key=AAAAiviCyAw:APA91bEzrzZHQSPXcXnU05OhKwrRE2Ma3B6-R5cR6UnnOKXrbeFcGCKLcrgQqnToRGOYCMgchHE79eb7UgW9u09TYMRpJaO_6-rDNmlEFi6UpazpnK7wtuJLi5KmIaRNd9Dzz1XlhyUy',
    };
    const notification = await axios.post(
      `https://fcm.googleapis.com/fcm/send`,
      notificationPayload,
      {
        headers: headers,
      },
    );
    return notification.data;
  } catch (err) {
    throw new HttpErrors.TooManyRequests('something went wrong !! try again');
  }
}
