/*==============================================================*/
// Kozi Forms Scripts  JS
/*==============================================================*/
(function ($) {
  "use strict"; // Start of use strict

  const api = document.getElementById("api").getAttribute("content");

  const formIds = {
    contact: "contactForm",
    quote: "quoteForm",
    comment: "commentForm",
    internet: "internetForm",
    tv: "tvForm",
    telematics: "telematicsForm",
    career: "careerForm",
    subscribe: "subscribeForm",
    offerForm: "offerForm",
  };

  $("#contactForm")
    .validator()
    .on("submit", function (event) {
      if (event.isDefaultPrevented()) {
        // handle the invalid form...
        formError(formIds.contact);
        submitMSG(formIds.contact, false, "Did you fill in the form properly?");
      } else {
        // everything looks good!
        event.preventDefault();
        submitForm(formIds.contact, `${api}/messages`);
      }
    });

  $("#quoteForm")
    .validator()
    .on("submit", function (event) {
      if (event.isDefaultPrevented()) {
        // handle the invalid form...
        formError(formIds.quote);
        submitMSG(formIds.quote, false, "Did you fill in the form properly?");
      } else {
        // everything looks good!
        event.preventDefault();
        submitForm(formIds.quote, `${api}/quotes`);
      }
    });

  $("#internetForm")
    .validator()
    .on("submit", function (event) {
      if (event.isDefaultPrevented()) {
        // handle the invalid form...
        formError(formIds.internet);
        submitMSG(
          formIds.internet,
          false,
          "Did you fill in the form properly?"
        );
      } else {
        // everything looks good!
        event.preventDefault();
        submitForm(formIds.internet, `${api}/packages/internet/request`);
      }
    });

  $("#tvForm")
    .validator()
    .on("submit", function (event) {
      if (event.isDefaultPrevented()) {
        // handle the invalid form...
        formError(formIds.tv);
        submitMSG(formIds.tv, false, "Did you fill in the form properly?");
      } else {
        // everything looks good!
        event.preventDefault();
        submitForm(formIds.tv, `${api}/packages/tv/request`);
      }
    });
  $("#careerForm")
    .validator()
    .on("submit", function (event) {
      if (event.isDefaultPrevented()) {
        // handle the invalid form...
        formError(formIds.career);
        submitMSG(formIds.career, false, "Did you fill in the form properly?");
      } else {
        // everything looks good!
        event.preventDefault();
        const career = $("#careerForm [name='career']").val();

        submitForm(formIds.career, `${api}/careers/${career}/apply`, true);
      }
    });
  $("#subscribeForm")
    .validator()
    .on("submit", function (event) {
      if (event.isDefaultPrevented()) {
        // handle the invalid form...
        formError(formIds.subscribe);
        submitMSG(
          formIds.subscribe,
          false,
          "Did you fill in the form properly?"
        );
      } else {
        // everything looks good!
        event.preventDefault();
        submitForm(formIds.subscribe, `${api}/subscribers`);
      }
    });
  $("#telematicsForm")
    .validator()
    .on("submit", function (event) {
      if (event.isDefaultPrevented()) {
        // handle the invalid form...
        formError(formIds.telematics);
        submitMSG(
          formIds.telematics,
          false,
          "Did you fill in the form properly?"
        );
      } else {
        // everything looks good!
        event.preventDefault();
        submitForm(
          formIds.telematics,
          `${api}/packages/telematics/request-demo`
        );
      }
    });

  $("#offerForm")
    .validator()
    .on("submit", function (event) {
      if (event.isDefaultPrevented()) {
        // handle the invalid form...
        formError(formIds.offerForm);
        submitMSG(
          formIds.offerForm,
          false,
          "Did you fill in the form properly?"
        );
      } else {
        // everything looks good!
        event.preventDefault();
        submitForm(formIds.offerForm, `${api}/offers/request`);
      }
    });

  function submitForm(formId, url, hasFiles = false) {
    showSubmitting(formId, true);

    // Initiate Variables With Form Content
    const formData = getFormData(formId);

    const data = Array.from(formData.entries()).reduce(
      (memo, [key, value]) => ({
        ...memo,
        [key]: value,
      }),
      {}
    );

    const options = {
      method: "POST",
      body: hasFiles ? formData : JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (hasFiles) {
      delete options["headers"];
    }

    fetch(url, { ...options })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          formSuccess(formId, data.message);
        } else {
          formError(formId);
          submitMSG(formId, false, data.message);
        }
      })
      .catch((err) => {
        formError(formId);
        if (err.response) submitMSG(formId, false, err.response.data.message);
        else submitMSG(false, "Unable to complete request. Try again later");
      })
      .finally(() => {
        showSubmitting(formId, false);
      });
  }

  function formSuccess(formId, message = "Request Submitted successfully!") {
    document.getElementById(formId).reset();
    submitMSG(formId, true, message);
  }

  function formError(formId) {
    $(`#${formId}`)
      .removeClass()
      .addClass("shake animated")
      .one(
        "webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend",
        function () {
          $(this).removeClass();
        }
      );
  }

  function submitMSG(formId, valid, msg) {
    if (valid) {
      var msgClasses = "h4 text-center tada animated text-success";
    } else {
      var msgClasses = "h4 text-center text-danger";
    }
    $(`form#${formId} #msgSubmit`).removeClass().addClass(msgClasses).text(msg);
  }

  function showSubmitting(formId, disable = true) {
    const submitButton = document.querySelector(
      `form#${formId} button[type=submit]`
    );
    submitButton.setAttribute("disable", disable);

    if (disable) {
      submitButton.setAttribute("data-text", submitButton.textContent);
      submitButton.textContent = "Please wait ...";
    } else {
      submitButton.textContent = submitButton.getAttribute("data-text");
    }
  }

  function getFormData(formId) {
    const form = document.querySelector(`form#${formId}`);
    const formData = new FormData();

    return [].reduce.call(
      form.elements,
      (formData, element) => {
        if (element.files) {
          formData.append(
            element.name,
            element.multiple ? element.files : element.files[0]
          );
        } else {
          if (element.getAttribute("data-value-target")) {
            let target = element.getAttribute("data-value-target");

            formData.append(element.name, $(`#${target}`).val().split(","));
          } else {
            formData.append(element.name, element.value);
          }
        }
        return formData;
      },
      formData
    );
  }
})(jQuery); // End of use strict
