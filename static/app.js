class Chatbox {
  constructor() {
    this.args = {
      openButton: document.querySelector(".chatbox__button"),
      chatBox: document.querySelector(".chatbox__support"),
      sendButton: document.querySelector(".send__button"),
    };

    this.state = false;
    this.messages = [];
  }

  display() {
    const { openButton, chatBox, sendButton } = this.args;

    openButton.addEventListener("click", () => this.toggleState(chatBox));

    sendButton.addEventListener("click", () => this.onSendButton(chatBox));

    const node = chatBox.querySelector("input");
    node.addEventListener("keyup", ({ key }) => {
      if (key === "Enter") {
        this.onSendButton(chatBox);
      }
    });

    const links = chatBox.querySelectorAll("a");
    links.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const message = link.textContent;
        this.sendMessage(message);
      });
    });
  }

  toggleState(chatbox) {
    this.state = !this.state;

    // show or hides the box
    if (this.state) {
      chatbox.classList.add("chatbox--active");
    } else {
      chatbox.classList.remove("chatbox--active");
    }
  }

  onSendButton(chatbox) {
    var textField = chatbox.querySelector("input");
    let text1 = textField.value;
    if (text1 === "") {
      return;
    }

    let msg1 = { name: "User  ", message: text1 };
    this.messages.push(msg1);
    this.updateChatText(chatbox);

    // Cek jika pesan adalah pengiriman form
    if (text1.includes("Kirim")) {
      const form = chatbox.querySelector("form");

      // Mencegah form melakukan submit default
      event.preventDefault(); // Pastikan ini ada di sini

      const formData = new FormData(form);

      fetch("http://127.0.0.1:5000/kontak_admin", {
        method: "POST",
        body: formData,
      })
        .then((response) => {
          if (response.ok) {
            alert("Email terkirim!"); // Alert berhasil
            // Tampilkan pesan "Email terkirim" di chatbox
            let msg2 = { name: "iBot", message: "Email terkirim" };
            this.messages.push(msg2);
            this.updateChatText(chatbox); // Perbarui chatbox
            form.reset(); // Reset form
          } else {
            // Tampilkan alert pop-up error
            alert("Gagal mengirim email.");
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          alert("Terjadi kesalahan saat mengirim email."); // Alert gagal
        });
    } else {
      // Handle regular messages
      fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        body: JSON.stringify({ message: text1 }),
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((r) => r.json())
        .then((r) => {
          let msg2 = { name: "iBot", message: r.answer };
      
          this.updateChatText(chatbox);
          textField.value = "";
        })
        .catch((error) => {
          console.error("Error:", error);
          this.updateChatText(chatbox);
          textField.value = "";
        });
    }

    // JANGAN DI OTAK ATIK YANG INI
    fetch("http://127.0.0.1:5000/predict", {
      method: "POST",
      body: JSON.stringify({ message: text1 }),
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((r) => r.json())
      .then((r) => {
        this.updateChatText(chatbox);
        textField.value = "";
        // Jika respons mengandung follow_up
        if (r.answer && r.answer.follow_up) {
          let followUpText =
            r.answer.text + "\n" + r.answer.follow_up.join("\n");
          let msg2 = { name: "iBot", message: followUpText };
          this.messages.push(msg2);
        } else {
          let msg2 = { name: "iBot", message: r.answer };
          this.messages.push(msg2);
        }
        this.updateChatText(chatbox);
        textField.value = "";
      })
      .catch((error) => {
        console.error("Error:", error);
        this.updateChatText(chatbox);
        textField.value = "";
      });
  }

  sendMessage(message) {
    var textField = document.querySelector(".chatbox__support input");
    textField.value = message;
    var sendButton = document.querySelector(".send__button");
    sendButton.click();
  }

  updateChatText() {
    var html = "";
    this.messages
      .slice()
      .reverse()
      .forEach((item) => {
        if (item.name === "iBot") {
          html +=
            '<div class="messages__item messages__item--visitor">' +
            item.message +
            "</div>";
        } else {
          html +=
            '<div class="messages__item messages__item--operator">' +
            item.message +
            "</div>";
        }
      });

    const chatmessage = this.args.chatBox.querySelector(".chatbox__messages");
    chatmessage.innerHTML = html;

    // Tambahkan event listener untuk tautan
    const links = chatmessage.querySelectorAll("a");
    links.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const message = link.textContent; // Ambil teks dari tautan
        this.sendMessage(message); // Panggil sendMessage
      });
    });
  }
}

const chatbox = new Chatbox();
chatbox.display();
