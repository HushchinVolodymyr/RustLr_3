"use client";
import Header from "@/components/page-block/header";
import { Separator } from "@chakra-ui/react"
import ToDoBlock from "@/components/page-block/to-do-block/to-do-block";
import {useState} from "react";
import axios from "axios";

interface Task {
  id: number;
  name: string;
  description: string;
  status: string;
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);

  const fetchTasks = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8080/api/tasks");

      if (response.status === 200) {
        const tasksResponse = response.data.sort((a: Task, b: Task) => a.id - b.id);
        setTasks(tasksResponse);

      }

    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  }
  
  return (
    <div className={"px-4"}>
      <Header fetchTasks={fetchTasks}/>
      <Separator />  
      <ToDoBlock tasks={tasks} fetchTasks={fetchTasks}/>
    </div>
  )
}
