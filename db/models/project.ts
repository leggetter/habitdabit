import { Field, PrimaryKey, TigrisCollection, TigrisDataTypes } from "@tigrisdata/core";

@TigrisCollection("projects")
export class Project {
  @PrimaryKey(TigrisDataTypes.INT32, { order: 1, autoGenerate: true })
  id?: number;

  @Field()
  name!: string;

  @Field({ maxLength: 128, })
  goalDescription!: string;

  @Field(TigrisDataTypes.INT32)
  ownerId!: number;

  @Field(TigrisDataTypes.ARRAY, { elements: TigrisDataTypes.INT32 })
  adminIds!: Array<number>;

  @Field(TigrisDataTypes.INT32)
  championId!: number;

  @Field(TigrisDataTypes.DATE_TIME, { timestamp: "createdAt" })
  createdAt?: Date;

  @Field(TigrisDataTypes.DATE_TIME)
  startDate!: Date;
}
