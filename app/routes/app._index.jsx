// app/routes/app._index.jsx
import { redirect } from "@remix-run/node";

export const loader = async () => {
  // Redirect to the main index page
  return redirect("/");
};
