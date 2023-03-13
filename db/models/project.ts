import { Field, PrimaryKey, TigrisCollection, TigrisDataTypes } from "@tigrisdata/core";

export interface ISingleHabitTemplate {
  description?: string;

  value?: number;
}

class SingleHabitTemplate implements ISingleHabitTemplate {
  @Field()
  public description?: string;

  @Field()
  public value?: number;
}

class DailyHabitTemplate {
  @Field(TigrisDataTypes.ARRAY, { elements: SingleHabitTemplate })
  habits: Array<SingleHabitTemplate> = []
}

// export interface ISingleScheduledHabit extends ISingleHabitTemplate {
//   completed?: boolean;
// }

export interface IWeeklyHabitTemplate {
  days: Array<DailyHabitTemplate>;
}

class WeeklyHabitTemplate implements IWeeklyHabitTemplate {
  @Field(TigrisDataTypes.ARRAY, { elements: DailyHabitTemplate })
  days: Array<DailyHabitTemplate> = [];
}

// class SingleScheduledHabit extends SingleHabitTemplate implements ISingleScheduledHabit {
//   @Field({ default: false })
//   public completed?: boolean;
// }

// export interface IScheduledHabits {
//   weekStartDate?: Date;
//   days: Array<DailyHabitTemplate>;
// }

// class ScheduledHabits implements IScheduledHabits {
//   @Field(TigrisDataTypes.DATE_TIME)
//   weekStartDate?: Date;

//   /**
//    * An Array that should have 7 elements (0 - 6) for each day of the week.
//    * Each element should be an Array<DailyHabitTemplate>
//    */
//   @Field({ elements: Array<DailyHabitTemplate> })
//   days: Array<DailyHabitTemplate> = [];
// }


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

  @Field()
  habitsScheduleTemplate?: WeeklyHabitTemplate;

  // @Field(TigrisDataTypes.OBJECT, { elements: ScheduledHabits })
  // scheduledHabits: ScheduledHabits = new ScheduledHabits();
}
