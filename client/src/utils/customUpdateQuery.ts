import { QueryInput, Cache } from "@urql/exchange-graphcache";

// helper function that will cast the types
export function customUpdateQuery<Result, Query>(
    cache: Cache,
    qi: QueryInput,
    result: any,
    fn: (r: Result, q: Query) => Query) {
    return cache.updateQuery(qi, (data) => fn(result, data as any) as any);
}
