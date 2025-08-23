import { Entity } from "./entity";

export type EntitySchema<T> = T extends Entity<infer Schema> ? Schema : never;
