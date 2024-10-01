export const RoleAccess = async (role, access) => {

    if (role === 'ADMIN') {
        let preAccess = {
            lead: ['create', 'read', 'update', 'delete'],
            user: ['create', 'read', 'update', 'delete'],
            project: ['create', 'read', 'update', 'delete'],
            task: ['create', 'read', 'update', 'delete'],
            contract: ['create', 'read', 'update', 'delete'],
            quotation: ['create', 'read', 'update', 'delete'],
            file: ['create', 'read', 'delete'],
            archive: ['read', 'restore', 'delete'],
            mom: ['create', 'read', 'update', 'delete'],
            addMember: ['create', 'read', 'update', 'delete'],
            role: ['create', 'read', 'update', 'delete']
        };

        // Assuming access is an object with the same structure as preAccess
        for (const key in access) {
            if (preAccess[key]) {
                // Replace existing permissions with new permissions from access[key]
                preAccess[key] = access[key];
            } else {
                preAccess[key] = access[key];
            }
        }

        return preAccess;
    }
    else if (role === 'Senior Architect') {
        let preAccess = {
            lead: ['create', 'read', 'update', 'delete'],
            project: ['create', 'read', 'update', 'delete'],
            task: ['create', 'read', 'update', 'delete'],
            contract: ['create', 'read', 'update', 'delete'],
            quotation: ['create', 'read', 'update', 'delete'],
            file: ['create', 'read', 'delete'],
            archive: ['read', 'restore', 'delete'],
            mom: ['create', 'read', 'update', 'delete'],

        };

        // Assuming access is an object with the same structure as preAccess
        for (const key in access) {
            if (preAccess[key]) {
                // Replace existing permissions with new permissions from access[key]
                preAccess[key] = access[key];
            } else {
                preAccess[key] = access[key];
            }
        }

        return preAccess;
    }
    else if (role === 'Project Architect') {
        let preAccess = {
            lead: ['create', 'read', 'update', 'delete'],
            project: ['create', 'read', 'update', 'delete'],
            task: ['read', 'update', 'delete'],
            file: ['create', 'read', 'delete'],
            archive: ['read', 'restore', 'delete'],
            mom: ['create', 'read', 'update', 'delete'],

        };

        // Assuming access is an object with the same structure as preAccess
        for (const key in access) {
            if (preAccess[key]) {
                // Replace existing permissions with new permissions from access[key]
                preAccess[key] = access[key];
            } else {
                preAccess[key] = access[key];
            }
        }

        return preAccess;
    }
    else if (role === 'Executive Assistant') {
        let preAccess = {

            project: ['read', 'update', 'delete'],
            quotation: ['create', 'read', 'update', 'delete'],
            file: ['create', 'read', 'delete'],
            archive: ['read', 'restore', 'delete'],


        };

        // Assuming access is an object with the same structure as preAccess
        for (const key in access) {
            if (preAccess[key]) {
                // Replace existing permissions with new permissions from access[key]
                preAccess[key] = access[key];
            } else {
                preAccess[key] = access[key];
            }
        }

        return preAccess;
    }
    else if (role === 'Jr. Executive HR & Marketing') {
        let preAccess = {
            file: ['create', 'read', 'delete'],
            archive: ['read', 'restore', 'delete'],
        };

        // Assuming access is an object with the same structure as preAccess
        for (const key in access) {
            if (preAccess[key]) {
                // Replace existing permissions with new permissions from access[key]
                preAccess[key] = access[key];
            } else {
                preAccess[key] = access[key];
            }
        }

        return preAccess;
    }
    else if (role === '3D Visualizer') {
        let preAccess = {

            project: ['create', 'read', 'update', 'delete'],
            task: ['create', 'read', 'update', 'delete'],
            file: ['create', 'read', 'delete'],
            archive: ['read', 'restore', 'delete'],
            mom: ['create', 'read', 'update', 'delete'],

        };

        // Assuming access is an object with the same structure as preAccess
        for (const key in access) {
            if (preAccess[key]) {
                // Replace existing permissions with new permissions from access[key]
                preAccess[key] = access[key];
            } else {
                preAccess[key] = access[key];
            }
        }

        return preAccess;
    }
    else if (role === 'Jr. Interior Designer') {
        let preAccess = {
            lead: ['read', 'update', 'delete'],
            project: ['read', 'update', 'delete'],
            task: ['create', 'read', 'update', 'delete'],
            file: ['create', 'read', 'delete'],
            archive: ['read', 'restore', 'delete'],
            mom: ['create', 'read', 'update', 'delete'],

        };

        // Assuming access is an object with the same structure as preAccess
        for (const key in access) {
            if (preAccess[key]) {
                // Replace existing permissions with new permissions from access[key]
                preAccess[key] = access[key];
            } else {
                preAccess[key] = access[key];
            }
        }

        return preAccess;
    }
    else if (role === 'Site Supervisor') {
        let preAccess = {


            file: ['create', 'read', 'delete'],
            archive: ['read', 'restore', 'delete'],


        };

        // Assuming access is an object with the same structure as preAccess
        for (const key in access) {
            if (preAccess[key]) {
                // Replace existing permissions with new permissions from access[key]
                preAccess[key] = access[key];
            } else {
                preAccess[key] = access[key];
            }
        }

        return preAccess;
    }
    else {
        let preAccess = {};

        // Assuming access is an object with the same structure as preAccess
        for (const key in access) {
            if (preAccess[key]) {
                // Replace existing permissions with new permissions from access[key]
                preAccess[key] = access[key];
            } else {
                preAccess[key] = access[key];
            }
        }

        return preAccess;
    }

}
