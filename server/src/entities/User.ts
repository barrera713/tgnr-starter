import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, Int, ObjectType } from 'type-graphql';

// We can stack decorators
// its both an ObjectType and Entity
@ObjectType()
@Entity()
export class User {

  @Field( () => Int) // Explicitly set the type for each field
  @PrimaryKey()
  id!: number;
  
  @Field(() => String)
  @Property({type: 'date'})
  createdAt = new Date();

  @Field(() => String)
  @Property({ type: 'date', onUpdate: () => new Date() }) // hook that creates new date everytime we update  
  updatedAt = new Date();

  @Field(() => String) // If field is not listed, it will not allow Graphql to query it
  @Property({type: 'text', unique: true })
  username!: string;

  // removed Field as to not alloq graphql to query
  @Property({type: 'text'})
  password!: string;
};