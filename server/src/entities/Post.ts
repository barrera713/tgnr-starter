import { Field, Int, ObjectType } from 'type-graphql';
import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from './User';

// We can stack decorators
// its both an ObjectType and Entity
@ObjectType()
@Entity()
// Base Entity allows usage of basics commands such as .find, .insert, etc 
export class Post extends BaseEntity {

  @Field( () => Int) // Explicitly set the type for each field
  @PrimaryGeneratedColumn()
  id!: number;
  
  
  @Field(() => String) // If field is not listed, it will not allow Graphql to query it
  @Column()
  title!: string;

  @Field()
  @Column({ type: 'int', default: 0 })
  text!: string;

  @Field()
  @Column()
  points!: number;

  @Field()
  @Column()
  createdId: number;
  
  // created foreign key to the user's table
  @ManyToOne(() => User, user => user.posts)
  creator: User;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn() // hook that creates new date everytime we update  
  updatedAt: Date;

};