import { ObjectType } from 'type-graphql';
import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Post } from './Post';
import { User } from './User';

// many to many
// user --> join table <-- posts
//            updoot

@ObjectType()
@Entity()
export class Updoot extends BaseEntity {   
    @Column({type: 'int'})
    value: number;

    @PrimaryColumn()
    userId: number;

    @PrimaryColumn()
    postId: number;

    @ManyToOne(() => User, (user) => user.updoots)
    user: User;
    
    @ManyToOne(() => Post, (post) => post.updoots, {
        onDelete: "CASCADE"
    })
    post: Post

};