"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { NavLink } from "@/data/mockData";

interface Position {
  left: number;
  width: number;
  opacity: number;
}

interface NavHeaderProps {
  links: NavLink[];
}

export default function NavHeader({ links }: NavHeaderProps) {
  const [position, setPosition] = useState<Position>({
    left: 0,
    width: 0,
    opacity: 0,
  });

  return (
    <ul
      className="relative flex w-fit rounded-full border border-[rgba(244,236,216,0.12)] bg-white/5 p-1"
      onMouseLeave={() => setPosition((pv) => ({ ...pv, opacity: 0 }))}
    >
      {links.map((link) => (
        <Tab
          key={link.label}
          href={link.href}
          active={link.active}
          setPosition={setPosition}
        >
          {link.label}
        </Tab>
      ))}
      <Cursor position={position} />
    </ul>
  );
}

const Tab = ({
  children,
  href,
  active,
  setPosition,
}: {
  children: React.ReactNode;
  href: string;
  active?: boolean;
  setPosition: React.Dispatch<React.SetStateAction<Position>>;
}) => {
  const ref = useRef<HTMLLIElement>(null);
  return (
    <li
      ref={ref}
      onMouseEnter={() => {
        if (!ref.current) return;
        const { width } = ref.current.getBoundingClientRect();
        setPosition({ width, opacity: 1, left: ref.current.offsetLeft });
      }}
      className={`relative z-10 cursor-pointer px-5 py-2 font-body text-sm transition-colors duration-200 ${
        active ? "text-primary" : "text-text-primary hover:text-primary"
      }`}
    >
      <Link href={href}>{children}</Link>
    </li>
  );
};

const Cursor = ({ position }: { position: Position }) => {
  return (
    <motion.li
      animate={{ left: position.left, width: position.width, opacity: position.opacity }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="absolute z-0 top-1 h-[calc(100%-8px)] rounded-full bg-primary/20 border border-primary/40"
    />
  );
};
