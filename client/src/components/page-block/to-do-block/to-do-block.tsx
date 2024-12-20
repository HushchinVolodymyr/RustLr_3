"use client";
import React, {useEffect, useState} from 'react';
import {Input, Text, Textarea} from "@chakra-ui/react"
import axios from "axios";
import {Card} from "@chakra-ui/react"
import {Button} from "@/components/ui/button";
import {Check, Pencil, Trash2} from "lucide-react";
import {toaster} from "@/components/ui/toaster";
import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {Field} from "@/components/ui/field";

interface Task {
  id: number;
  name: string;
  description: string;
  status: string;
}

interface updatedTaskI {
  name: string;
  description: string;
}

interface ToDoBlockProps {
  tasks: Task[];
  fetchTasks: () => void;
}

const ToDoBlock: React.FC<ToDoBlockProps> = ({ tasks, fetchTasks }) => {
  const [updatedTaskData, setUpdatedTaskData] = React.useState<updatedTaskI>({
    name: "",
    description: "",
  });
   
  
  useEffect(() => {
    fetchTasks();
  }, [])

  const completeTask = async (task: Task) => {
    const taskCompleted: Task = {
      id: task.id,
      name: task.name,
      description: task.description,
      status: task.status === "assigned" ? "completed" : "assigned",
    }

    try {
      // Save data to the server
      const response = await axios.put(`http://127.0.0.1:8080/api/tasks/${task.id}`, taskCompleted);

      if (response.status === 200) {
        console.log("Task completed successfully");
        
        if (task.status === "completed") {
          toaster.create({
            title: "Assigned",
            description: `Task ${task.name}`,
            type: "success",
          });
        } else {
          toaster.create({
            title: "Completed",
            description: `Task ${task.name} completed`,
            type: "success",
          });
        }
        
        fetchTasks();

      }

    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  }
  
  const deleteTask = async (task: Task) => {
    try {
      // Save data to the server
      const response = await axios.delete(`http://127.0.0.1:8080/api/tasks/${task.id}`);
      if (response.status === 204) {
        console.log("Task completed successfully");

        toaster.create({
          title: "Deleted",
          description: `Task ${task.name} deleted`,
          type: "success",
        });

        fetchTasks();

      }

    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
      
  }

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setUpdatedTaskData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const updateTask = async (task: Task) => {
    const taskUpdated: Task = {
      id: task.id,
      name: updatedTaskData.name,
      description: updatedTaskData.description,
      status: task.status,
    }
    
    try {
      // Save data to the server
      const response = await axios.put(`http://127.0.0.1:8080/api/tasks/${task.id}`, taskUpdated);
      if (response.status === 200) {
        console.log("Task completed successfully");

        toaster.create({
          title: "Updated",
          description: `Task ${task.name} updated`,
          type: "success",
        });

        fetchTasks();

      }

    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  }
  

  return (
    <div className={"flex mt-4 gap-2"}>
      <div className="assigneed w-1_2">
        <Text textStyle={"2xl"} className={"text-center"}>Assigneed</Text>
        <div className={"flex flex-column gap-1 mt-4"}>
          {tasks.map((task: Task) => {
            if (task.status === "assigned") {
              return (
                <Card.Root key={task.id} variant={"subtle"}>
                  <Card.Body gap="2">
                    <Card.Title mb="2" className={"flex justify-between"}>
                      <Text textStyle={"2xl"} truncate>{task.name}</Text>
                      
                      <Button size={"xs"} variant="surface" onClick={() => completeTask(task)}>Complete</Button>
                    </Card.Title>
                    <Card.Description>
                      <Text lineClamp="2">
                        {task.description}
                      </Text>
                    </Card.Description>
                  </Card.Body>
                  <Card.Footer justifyContent="flex-end">
                    
                    <DialogRoot
                      placement={"center"}
                      motionPreset="slide-in-bottom"
                    >
                      <DialogTrigger asChild>
                        <Button size={"sm"}
                        onClick={() => {
                          setUpdatedTaskData({
                            name: task.name,
                            description: task.description,
                          });
                        }}><Pencil/>Edit</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Task</DialogTitle>
                        </DialogHeader>
                        <DialogBody>
                          <Field label="Name">
                            <Input
                              name="name"
                              placeholder="Task name"
                              value={updatedTaskData.name}
                              onChange={handleChange}
                            />
                          </Field>
                          <Field label="Description">
                            <Textarea
                              name="description"
                              placeholder="Description..."
                              value={updatedTaskData.description}
                              onChange={handleChange}
                              className={"h-10"}
                            />
                          </Field>
                        </DialogBody>
                        <DialogFooter>
                          <DialogActionTrigger asChild>
                            <Button variant="outline">Cancel</Button>
                          </DialogActionTrigger>
                          <Button colorPalette={"green"}
                          onClick={() => updateTask(task)}>Save</Button>
                        </DialogFooter>
                        <DialogCloseTrigger />
                      </DialogContent>
                    </DialogRoot>
                    
                    
                    <DialogRoot>
                      <DialogTrigger asChild>
                        <Button
                          colorPalette={"red"}
                          size={"sm"}
                        ><Trash2/>Delete</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Task</DialogTitle>
                        </DialogHeader>
                        <DialogBody>
                          <p>
                            It`s delete task permanently. Are you sure?
                          </p>
                        </DialogBody>
                        <DialogFooter>
                          <DialogActionTrigger asChild>
                            <Button variant="outline">Cancel</Button>
                          </DialogActionTrigger>
                          <Button colorPalette={"red"} onClick={() => deleteTask(task)}>Delete</Button>
                        </DialogFooter>
                        <DialogCloseTrigger />
                      </DialogContent>
                    </DialogRoot>
                    
                  </Card.Footer>
                </Card.Root>
              )
            }
          })}
        </div>
      </div>
      <div className="completetd w-1_2">
        <Text textStyle={"2xl"} className={"text-center"}>Completed</Text>
        <div className={"flex flex-column gap-1 mt-4"}>
          {tasks.map((task: Task) => {
            if (task.status === "completed") {
              return (
                <Card.Root key={task.id} variant={"outline"} style={{background: "rgba(31, 255, 0, 0.05)"}}>
                  <Card.Body gap="2" >
                    <Card.Title mb="2" className={"flex justify-between"}>
                      <Text textStyle={"2xl"} truncate  className={"flex align-center gap-1"}><Check color={"green"}/>{task.name}</Text>
                      <Button size={"xs"} variant="surface" onClick={() => completeTask(task)}>Assign</Button>
                    </Card.Title>
                    <Card.Description>
                      <Text lineClamp="2">
                        {task.description}
                      </Text>
                    </Card.Description>
                  </Card.Body>
                  <Card.Footer justifyContent="flex-end">
                    <DialogRoot
                      placement={"center"}
                      motionPreset="slide-in-bottom"
                    >
                      <DialogTrigger asChild>
                        <Button size={"sm"}
                                onClick={() => {
                                  setUpdatedTaskData({
                                    name: task.name,
                                    description: task.description,
                                  });
                                }}><Pencil/>Edit</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Task</DialogTitle>
                        </DialogHeader>
                        <DialogBody>
                          <Field label="Name">
                            <Input
                              name="name"
                              placeholder="Task name"
                              value={updatedTaskData.name}
                              onChange={handleChange}
                            />
                          </Field>
                          <Field label="Description">
                            <Textarea
                              name="description"
                              placeholder="Description..."
                              value={updatedTaskData.description}
                              onChange={handleChange}
                              className={"h-10"}
                            />
                          </Field>
                        </DialogBody>
                        <DialogFooter>
                          <DialogActionTrigger asChild>
                            <Button variant="outline">Cancel</Button>
                          </DialogActionTrigger>
                          <Button colorPalette={"green"}
                                  onClick={() => updateTask(task)}>Save</Button>
                        </DialogFooter>
                        <DialogCloseTrigger />
                      </DialogContent>
                    </DialogRoot>
                    <DialogRoot>
                      <DialogTrigger asChild>
                        <Button
                          colorPalette={"red"}
                          size={"sm"}
                        ><Trash2/>Delete</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Task</DialogTitle>
                        </DialogHeader>
                        <DialogBody>
                          <p>
                            It`s delete task permanently. Are you sure?
                          </p>
                        </DialogBody>
                        <DialogFooter>
                          <DialogActionTrigger asChild>
                            <Button variant="outline">Cancel</Button>
                          </DialogActionTrigger>
                          <Button colorPalette={"red"} onClick={() => deleteTask(task)}>Delete</Button>
                        </DialogFooter>
                        <DialogCloseTrigger />
                      </DialogContent>
                    </DialogRoot>
                  </Card.Footer>
                </Card.Root>
              )
            }
          })}
        </div>
      </div>
    </div>
  );
};

export default ToDoBlock;