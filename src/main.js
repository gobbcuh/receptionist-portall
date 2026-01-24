import { Router } from "./iconsss/router";
import { LoginPage } from "./webpages/Login";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { DashboardHome } from "./webpages/dashboard/DashboardHome";
import { RegisterPatient } from "./webpages/dashboard/RegisterPatient";
import { PatientList } from "./webpages/dashboard/PatientList";
import { CheckInQueue } from "./webpages/dashboard/CheckInQueue";
import { Billing } from "./webpages/dashboard/Billing";
import { NotFound } from "./webpages/NotFound";
import "./index.css";

// initialize router
const router = new Router();

// register routes
router.addRoute("/", () => new LoginPage().render());
router.addRoute("/dashboard", () => new DashboardLayout(new DashboardHome()).render());
router.addRoute("/dashboard/register", () => new DashboardLayout(new RegisterPatient()).render());
router.addRoute("/dashboard/patients", () => new DashboardLayout(new PatientList()).render());
router.addRoute("/dashboard/queue", () => new DashboardLayout(new CheckInQueue()).render());
router.addRoute("/dashboard/billing", () => new DashboardLayout(new Billing()).render());
router.addRoute("*", () => new NotFound().render());

// start the router
document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("root");
  if (root) {
    router.init(root);
  }
});
