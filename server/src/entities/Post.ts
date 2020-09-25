import { Field, Int, ObjectType } from 'type-graphql';
import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

// We can stack decorators
// its both an ObjectType and Entity
@ObjectType()
@Entity()
// Base Entity allows usage of basics commands such as .find, .insert, etc 
export class Post extends BaseEntity {

  @Field( () => Int) // Explicitly set the type for each field
  @PrimaryGeneratedColumn()
  id!: number;
  
  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn() // hook that creates new date everytime we update  
  updatedAt: Date;

  @Field(() => String) // If field is not listed, it will not allow Graphql to query it
  @Column()
  title!: string;

};