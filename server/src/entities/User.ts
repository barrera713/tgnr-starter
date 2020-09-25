import { Field, Int, ObjectType } from 'type-graphql';
import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

// We can stack decorators
// its both an ObjectType and Entity
@ObjectType()
@Entity()
export class User extends BaseEntity{

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
  @Column({ unique: true })
  username!: string;

  @Field(() => String) // If field is not listed, it will not allow Graphql to query it
  @Column({ unique: true })
  email!: string;

  // removed Field as to not alloq graphql to query
  @Column()
  password!: string;
};