import React from 'react';
import {
  Card,
  CardHeader,
  Divider
} from "@nextui-org/react";

const CardComponent = ({ title }) => {
  return (
    <div className="w-full">
      <Card className="mb-5" shadow="none">
        <CardHeader className="flex flex-col items-start">
          <p className="text-[30px]">{title}</p>
        </CardHeader>
        <Divider className="w-[100%]" />
      </Card>
    </div>
  );
};

export default CardComponent;
