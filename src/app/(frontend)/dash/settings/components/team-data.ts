import {isEqual, uniqWith} from "lodash";

const columns = [
  {name: "NAME", uid: "name", sortable: true},
  {name: "ROLE", uid: "role", sortable: true},
  {name: "STATUS", uid: "status", sortable: true},
  {name: "ACTIONS", uid: "actions"},
];

const users = [
  {
    id: 1,
    name: "Alex Johnson",
    role: "Owner",
    team: "Management",
    status: "active",
    age: "32",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
    email: "alex.johnson@prevema.com",
  },
  {
    id: 2,
    name: "Sarah Martinez",
    role: "Admin",
    team: "Operations",
    status: "active",
    age: "28",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
    email: "sarah.martinez@prevema.com",
  },
  {
    id: 3,
    name: "Michael Chen",
    role: "Member",
    team: "Events",
    status: "active",
    age: "26",
    avatar: "https://i.pravatar.cc/150?u=a04258114e29026702d",
    email: "michael.chen@prevema.com",
  },
  {
    id: 4,
    name: "Emma Davis",
    role: "Member",
    team: "Marketing",
    status: "pending",
    age: "24",
    avatar: "https://i.pravatar.cc/150?u=a048581f4e29026701d",
    email: "emma.davis@prevema.com",
  },
  {
    id: 5,
    name: "James Wilson",
    role: "Member",
    team: "Events",
    status: "vacation",
    age: "30",
    avatar: "https://i.pravatar.cc/150?u=a092581d4ef9026700d",
    email: "james.wilson@prevema.com",
  },
];

/**
 * To use this function you need to install lodash in your project
 * ```bash
 * npm install lodash
 * ```
 */
const rolesOptions = uniqWith(
  users.map((user) => {
    return {
      name: user.role,
      uid: user.role.toLowerCase(),
    };
  }),
  isEqual,
);

/**
 * To use this function you need to install lodash in your project
 * ```bash
 * npm install lodash
 * ```
 */
const statusOptions = uniqWith(
  users.map((user) => {
    return {
      name: user.status,
      uid: user.status.toLowerCase(),
    };
  }),
  isEqual,
);

export {columns, users, rolesOptions, statusOptions};
