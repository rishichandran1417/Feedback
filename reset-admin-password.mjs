import { createClient } from "@supabase/supabase-js";
import { stdin } from "node:process";

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    }
);

const password = process.env.NEW_ADMIN_PASSWORD;

if (!password) {
    throw new Error("Set NEW_ADMIN_PASSWORD first.");
}

const { error } = await supabase.auth.admin.updateUserById(
    "b3a8701f-12eb-49a2-846f-f0e7687fa32b",
    { password }
);

if (error) {
    console.error(error.message);
} else {
    console.log("Admin password updated.");
}