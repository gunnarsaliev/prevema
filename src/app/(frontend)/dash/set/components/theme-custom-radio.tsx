import type {RadioProps} from "@heroui/react";

import React from "react";
import {useRadio, VisuallyHidden} from "@heroui/react";
import {cn} from "@heroui/react";

interface ThemeCustomRadioProps extends RadioProps {
  variant: "light" | "dark";
}

export const ThemeCustomRadio = (props: ThemeCustomRadioProps) => {
  const {variant} = props;
  const {
    Component,
    children,
    description,
    getBaseProps,
    getWrapperProps,
    getInputProps,
    getLabelProps,
    getLabelWrapperProps,
    getControlProps,
  } = useRadio(props);
  const wrapperProps = getWrapperProps();

  return (
    <Component
      {...getBaseProps()}
      className={cn(
        "group hover:bg-content2 inline-flex flex-row-reverse justify-between overflow-visible",
        "rounded-large border-default-200 max-w-[300px] cursor-pointer gap-4 border-1 px-4 py-2.5 shadow-md",
        "relative h-[132px] flex-1 overflow-hidden",
      )}
    >
      <VisuallyHidden>
        <input {...getInputProps()} />
      </VisuallyHidden>
      <span
        {...getWrapperProps()}
        className={cn(
          wrapperProps["className"],
          "border-default border-2",
          "group-data-[selected=true]:border-default-foreground",
        )}
      >
        <span
          {...getControlProps()}
          className={cn(
            "bg-default-foreground text-primary-foreground transition-transform-opacity z-10 h-2 w-2 origin-center scale-0 rounded-full opacity-0 group-data-[selected=true]:scale-100 group-data-[selected=true]:opacity-100 motion-reduce:transition-none",
          )}
        />
      </span>
      <div {...getLabelWrapperProps()}>
        {children && <span {...getLabelProps()}>{children}</span>}
        {description && (
          <span className="text-small text-foreground opacity-70">{description}</span>
        )}
      </div>
      <div
        className={cn("absolute top-[37px] left-[32px]", {
          hidden: variant === "light",
        })}
      >
        <svg
          fill="none"
          height="80"
          viewBox="0 0 160 80"
          width="160"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="160" height="80" fill="black" rx="8"/>
          <rect x="8" y="8" width="40" height="6" fill="#27272A" rx="2"/>
          <rect x="8" y="20" width="40" height="6" fill="#27272A" rx="2"/>
          <rect x="8" y="32" width="40" height="6" fill="#27272A" rx="2"/>
          <rect x="56" y="8" width="96" height="12" fill="#3F3F46" rx="4"/>
          <rect x="56" y="28" width="96" height="44" fill="#27272A" rx="4"/>
        </svg>
      </div>

      <div
        className={cn("absolute top-[37px] left-[32px]", {
          hidden: variant === "dark",
        })}
      >
        <svg
          fill="none"
          height="80"
          viewBox="0 0 160 80"
          width="160"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="160" height="80" fill="white" rx="8"/>
          <rect x="8" y="8" width="40" height="6" fill="#F4F4F5" rx="2"/>
          <rect x="8" y="20" width="40" height="6" fill="#F4F4F5" rx="2"/>
          <rect x="8" y="32" width="40" height="6" fill="#F4F4F5" rx="2"/>
          <rect x="56" y="8" width="96" height="12" fill="#E4E4E7" rx="4"/>
          <rect x="56" y="28" width="96" height="44" fill="#F4F4F5" rx="4"/>
        </svg>
      </div>
    </Component>
  );
};
