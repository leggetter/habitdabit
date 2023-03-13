import { useRouter } from "next/router";
import Layout from "components/layout";

import {
  Heading,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Box,
  Text,
  Button,
  useDisclosure,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  FormControl,
  FormLabel,
  Input,
  HStack,
} from "@chakra-ui/react";
import { deepCopy, ProjectValues, useProject } from "lib/project-helpers";
import {
  ISingleHabitTemplate,
  IWeeklyHabitTemplate,
  Project,
} from "db/models/project";
import React, { useEffect, useState } from "react";
import { ConfirmDialog } from "components/confirm-dialog";

function DayOfWeekListing({
  day,
  habits,
  addButtonClicked,
  removeButtonClicked,
}: {
  day: string;
  habits: Array<ISingleHabitTemplate>;
  addButtonClicked: (day: string) => void;
  removeButtonClicked: (
    day: string,
    habitIndex: number,
    habitText: string
  ) => void;
}) {
  return (
    <Box mb={10} width={600}>
      <Heading as="h3" size="lg">
        {day}
      </Heading>
      {habits.length === 0 && <Box>No habits defined for {day}</Box>}
      {habits.map((habit, index) => {
        return (
          <HStack
            key={`${day}_habit_${index}`}
            align="stretch"
            alignContent="center"
            justifyContent="center"
            mt={2}
          >
            <Box width={400} mr={5}>
              {habit.description}
            </Box>
            <Box width={200} pr={5} textAlign="right">
              {habit.value}
            </Box>
            <Box>
              <Button
                title="Remove Habit"
                onClick={() => {
                  removeButtonClicked(day, index, habit.description!);
                }}
              >
                -
              </Button>
            </Box>
          </HStack>
        );
      })}
      <Box mt={2} textAlign="right">
        <Button
          title="Add new habit"
          onClick={() => {
            addButtonClicked(day);
          }}
        >
          +
        </Button>
      </Box>
    </Box>
  );
}

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const createWeeklyTemplate = (): IWeeklyHabitTemplate => {
  const template: IWeeklyHabitTemplate = {
    days: [
      // monday
      {
        habits: [],
      },
      // tuesday
      {
        habits: [],
      },
      // wednesday
      {
        habits: [],
      },
      // thursday
      {
        habits: [],
      },
      // friday
      {
        habits: [],
      },
      // saturday
      {
        habits: [],
      },
      // sunday
      {
        habits: [],
      },
    ],
  };
  return template;
};

export default function TemplatePage() {
  const router = useRouter();

  const [errors, setErrors] = useState<string[]>([]);
  const [savingButtonText, setSavingButtonText] = useState<string>("Save");
  const {
    project,
    error: projectError,
    isLoading,
  } = useProject(router.query.id as string);
  const [weeklySchedule, setWeeklySchedule] = useState<IWeeklyHabitTemplate>(
    project?.habitsScheduleTemplate || createWeeklyTemplate()
  );

  useEffect(() => {
    if (project?.habitsScheduleTemplate) {
      setWeeklySchedule(project.habitsScheduleTemplate);
    }
  }, [project]);

  useEffect(() => {
    if (projectError) {
      setErrors((prev) => {
        return [...prev, projectError];
      });
    }
  }, [projectError]);

  const [edited, setEdited] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    if (saving) {
      setSavingButtonText("Saving");
    } else if (edited) {
      setSavingButtonText("Save");
    } else {
      setSavingButtonText("Saved");
    }
  }, [saving, edited]);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
  const [confirmDialogText, setConfirmDialogText] = useState<string>("");
  const [confirmDialogAction, setConfirmDialogAction] = useState<string>("");

  const [editingHabit, setEditingHabit] = useState<{
    day: string;
    habitIndex?: number;
  } | null>(null);
  const [habitDescription, setHabitDescription] = useState<string>("");
  const [habitValue, setHabitValue] = useState<number>(0);

  const handleAddButtonClick = (day: string) => {
    setEditingHabit({ day });
    onOpen();
  };

  const handleRemoveButtonClick = (
    day: string,
    habitIndex: number,
    habitText: string
  ) => {
    setEditingHabit({ day, habitIndex });
    setConfirmDialogText(
      `Are you sure you want to delete the habit "${habitText}"`
    );
    setShowConfirmDialog(true);
    setConfirmDialogAction("DELETE_HABIT");
  };

  const handleConfirm = (action: string) => {
    switch (action) {
      case "CANCEL_CREATE_HABIT":
        confirmCancellingHabitCreation();
        break;
      case "DELETE_HABIT":
        handleHabitDelete();
        break;
    }
  };

  const handleHabitCancel = () => {
    if (habitDescription.length > 0 || habitValue > 0) {
      setConfirmDialogAction("CANCEL_CREATE_HABIT");
      setConfirmDialogText(
        "Are you sure you with to cancel creating the habit?"
      );
      setShowConfirmDialog(true);
    } else {
      onClose();
    }
  };

  const clearHabitEditing = () => {
    setHabitDescription("");
    setHabitValue(0);
    setEditingHabit(null);
  };

  const confirmCancellingHabitCreation = () => {
    onClose();
    setShowConfirmDialog(false);
    clearHabitEditing();
  };

  const handleHabitAdd = () => {
    if (editingHabit === null) {
      throw Error("editingHabitDay must be set");
    }
    const dayIndex = DAYS_OF_WEEK.indexOf(editingHabit.day);
    const scheduleDay = weeklySchedule.days[dayIndex];
    scheduleDay.habits.push({
      description: habitDescription,
      value: habitValue,
    });
    const updatedWeeklySchedule = deepCopy(weeklySchedule);
    setWeeklySchedule(updatedWeeklySchedule);
    setEdited(true);
    onClose();
    clearHabitEditing();
  };

  const handleHabitDelete = () => {
    const dayIndex = DAYS_OF_WEEK.indexOf(editingHabit!.day);
    const scheduleDay = weeklySchedule.days[dayIndex];
    scheduleDay.habits.splice(editingHabit?.habitIndex!, 1);

    const updatedWeeklySchedule = deepCopy(weeklySchedule);
    setWeeklySchedule(updatedWeeklySchedule);
    setEdited(true);
    setShowConfirmDialog(false);
    clearHabitEditing();
  };

  const calculateTotalValue = (weeklySchedule: IWeeklyHabitTemplate) => {
    let totalValue = 0;
    weeklySchedule.days.forEach((day) => {
      day.habits.forEach((habit) => {
        totalValue += habit.value || 0;
      });
    });
    return totalValue;
  };

  const saveWeeklyScheduleTemplate = async () => {
    setSaving(true);
    const projectValues = new ProjectValues({
      habitsScheduleTemplate: weeklySchedule,
    });
    const params: RequestInit = {
      headers: {
        "Content-Type": "application/json",
      },
      method: "PATCH",
      body: JSON.stringify(projectValues),
    };

    try {
      const response = await fetch(`/api/v1/projects/${project!.id}`, params);
      if (response.status === 200) {
        const body = (await response.json()) as Project;
        setEdited(false);
      } else {
        const body = await response.json();
        setErrors((prev) => {
          return [...prev, body.error];
        });
      }
    } catch (err: any) {
      console.error(err);
      setErrors((prev) => [...prev, err.toString()]);
    }
    setSaving(false);
  };

  return (
    <Layout>
      {isLoading && <p>⏲️ Loading...</p>}
      {errors.length > 0 && (
        <p>
          {errors.map((e) => {
            return <p>{e}</p>;
          })}
        </p>
      )}
      {errors.length === 0 && !isLoading && !project && (
        /* TODO: this should be a 404 */ <p>No project found</p>
      )}
      <Breadcrumb mb={5}>
        <BreadcrumbItem>
          <BreadcrumbLink href="/dashboard">🏠 Dashboard</BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbItem>
          <BreadcrumbLink href={`/dashboard/projects/${project?.id}`}>
            {project?.name}
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href={`/dashboard/projects/${project?.id}/template`}>
            template
          </BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      <ConfirmDialog
        isOpen={showConfirmDialog}
        body={confirmDialogText}
        action={confirmDialogAction}
        onConfirm={handleConfirm}
        onCancel={() => {
          setShowConfirmDialog(false);
        }}
      />

      <Modal
        closeOnOverlayClick={false}
        isOpen={isOpen}
        onClose={handleHabitCancel}
        isCentered
        blockScrollOnMount={false}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create a new Habit</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <FormLabel>Habit description</FormLabel>
              <Input
                name="habit_description"
                onChange={(ev) => {
                  setHabitDescription(ev.target.value);
                }}
              />
            </FormControl>

            <FormControl mt={4}>
              <FormLabel>Value</FormLabel>
              <Input
                type="number"
                name="habit_value"
                onChange={(ev) => {
                  setHabitValue(Number(ev.target.value));
                }}
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleHabitAdd}>
              Add
            </Button>
            <Button onClick={handleHabitCancel}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {weeklySchedule && (
        <>
          <Box mt={5}>
            {DAYS_OF_WEEK.map((day, index) => (
              <DayOfWeekListing
                key={`day_of_week_${day}`}
                day={day}
                habits={weeklySchedule.days[index].habits}
                addButtonClicked={handleAddButtonClick}
                removeButtonClicked={handleRemoveButtonClick}
              />
            ))}
          </Box>
          <Box mb={5}>
            Total potential value: {calculateTotalValue(weeklySchedule)}
          </Box>
          <Box>
            <Button
              colorScheme="blue"
              isDisabled={!edited || saving}
              onClick={saveWeeklyScheduleTemplate}
            >
              {savingButtonText}
            </Button>
          </Box>
        </>
      )}
      {!weeklySchedule && <Text>No weekly schedule defined</Text>}
    </Layout>
  );
}
