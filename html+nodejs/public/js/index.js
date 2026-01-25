import { registerHandleSubmit, authenticateHandleSubmit } from "blisache-html";
import { BlisacheError } from "blisache-error";

document.querySelectorAll('.blisacheRegister').forEach(form => {
  form.addEventListener("submit", async function (event) {
  try {
      await registerHandleSubmit(event);
    } catch (error) {
      if (error instanceof BlisacheError) {
        event.target.classList.add("is-invalid");
        console.log(error);
      } else {
        throw error;
      }
    }
  });
});

document.querySelectorAll('.blisacheAuthenticate').forEach(form => {
  form.addEventListener("submit", async function (event) {
    try {
      await authenticateHandleSubmit(event);
    } catch (error) {
      if (error instanceof BlisacheError) {
        const inputs = Array.from(event.target.getElementsByTagName("input"));
        const blisacheLoginInputs = inputs.filter((e) => e.hasAttribute("data-blisache-login"));
        blisacheLoginInputs[0].classList.add("is-invalid");
        console.log(error);
      } else {
        throw error;
      }
    }
  });
  form.requestSubmit();
});
