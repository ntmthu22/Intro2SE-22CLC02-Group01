const roles = {
  admin: {
    can: ["read", "write", "delete"],
  },
  editor: {
    can: ["read", "write"],
  },
  viewer: {
    can: ["read"],
  },
};

module.exports = roles;
