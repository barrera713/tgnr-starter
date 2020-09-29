import DataLoader  from 'dataloader';
import { User } from '../entities/User';

// Essentially gets all the users in one query
// dataloader caches so it won't fetch the same user twice i.e removes duplicate keys
// @params [1,2,3,4,5]
// @return [{id: 1, username: "choppi"}, {id: 2, username: "bob"}]
export const createUserLoader = () => new DataLoader<number, User>(async userIds => {
    const users = await User.findByIds(userIds as number[])
    const userIdToUser: Record<number, User> = {};
    users.forEach(u => {
        userIdToUser[u.id] = u 
    })


    return userIds.map((userId) => userIdToUser[userId])
}) 