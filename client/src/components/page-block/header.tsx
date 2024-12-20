"use client"
import React, { useState } from 'react';
import { LayoutList, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Text, Textarea } from "@chakra-ui/react";
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
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import axios from "axios";
import { toaster } from "@/components/ui/toaster";

interface HeaderProps {
  fetchTasks: () => void;
}

const Header: React.FC<HeaderProps> = ({fetchTasks }) => {
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  // Dialog state (open/close)
  const [isDialogOpen, setDialogOpen] = useState(false);

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
    });
  };

  // Handle input changes
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Save form data
  const handleSave = async () => {
    console.log("Task Created:", formData);

    if (formData.name === "") {
      toaster.create({
        title: "Error",
        description: "Fill task fields",
        type: "error",
      });
      return;
    }

    const task = {
      name: formData.name,
      description: formData.description,
      status: "assigned",
    };

    try {
      // Save data to the server
      const response = await axios.post("http://127.0.0.1:8080/api/task", task);

      if (response.status === 200) {
        console.log("Task saved successfully");

        toaster.create({
          title: "Success",
          description: "Task created successfully",
          type: "success",
        });

        // Close the dialog after task creation
        setDialogOpen(false); // Close the dialog
        
                
        // Reset the form
        resetForm();
      }

    } catch (error) {
      console.error("Error saving task:", error);
    }

    fetchTasks();
  };
  

  return (
    <div className={"flex justify-between w-full align-center p-4"}>
      <div className={"w-10"}>
        <LayoutList />
      </div>
      <Text textStyle={"2xl"}>To do list</Text>
      <div className={"w-10 flex justify-end"}>
        <DialogRoot
          open={isDialogOpen}
          onOpenChange={(e) => setDialogOpen(e.open)}
          placement={"center"}
          motionPreset="slide-in-bottom"
        >
          <DialogTrigger asChild>
            <Button><Plus /> Create task</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                <Text textStyle={"2xl"}>Create task</Text>
              </DialogTitle>
            </DialogHeader>
            <DialogBody>
              <Field label="Name">
                <Input
                  name="name"
                  placeholder="Task name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </Field>
              <Field label="Description">
                <Textarea
                  name="description"
                  placeholder="Description..."
                  value={formData.description}
                  onChange={handleChange}
                  className={"h-10"}
                />
              </Field>
            </DialogBody>
            <DialogFooter>
              <DialogActionTrigger asChild>
                <Button variant="outline" onClick={resetForm}>Cancel</Button>
              </DialogActionTrigger>
              <Button onClick={handleSave}>Create</Button>
            </DialogFooter>
            <DialogCloseTrigger onClick={resetForm} />
          </DialogContent>
        </DialogRoot>
      </div>
    </div>
  );
};

export default Header;
