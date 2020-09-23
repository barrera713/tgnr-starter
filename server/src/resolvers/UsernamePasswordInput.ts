import { InputType, Field } from "type-graphql";

// generally do not have to explicitly set graphql type
// graphql can infer it from typescript
// Used for Args

@InputType()
export class UsernamePasswordInput {
    @Field()
    username: string;
    @Field()
    email: string;
    @Field()
    password: string;
}
