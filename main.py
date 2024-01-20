import tkinter as tk
from tkinter import messagebox, ttk


class Question:
    def __init__(self, text, answer):
        self.text = text
        self.answer = answer


class Quiz:
    def __init__(self, master, questions, choices):
        self.master = master
        self.questions = questions
        self.choices = choices
        self.current_question = 0
        self.score = 0

        self.master.title('クイズ')

        self.question_label = tk.Label(
            self.master, text=self.questions[self.current_question].text,
            font=("Helvetica", 16))
        self.question_label.pack(pady=10)

        self.var = tk.StringVar(self.master)
        self.var.set(self.choices[0])

        self.choice_frame = tk.Frame(self.master)
        self.choice_frame.pack(pady=10)

        for choice in self.choices:
            tk.Radiobutton(self.choice_frame, text=choice, variable=self.var,
                           value=choice, font=("Helvetica", 14)).pack(anchor='w')

        self.progress = ttk.Progressbar(
            self.master, length=300, mode='determinate', maximum=len(self.questions))
        self.progress.pack(pady=10)

        self.submit_button = tk.Button(
            self.master,
            text='回答する',
            command=self.check_answer,
            font=("Helvetica", 14)
        )
        self.submit_button.pack(pady=10)

    def check_answer(self):
        selected_answer = self.var.get()
        if selected_answer == self.questions[self.current_question].answer:
            self.score += 1
        self.current_question += 1
        self.progress['value'] = self.current_question
        self.master.update_idletasks()

        if self.current_question < len(self.questions):
            self.var.set(self.choices[0])
            self.question_label.config(
                text=self.questions[self.current_question].text)
        else:
            messagebox.showinfo(
                "結果", f"あなたのスコアは {self.score}/{len(self.questions)} です。"
            )
            self.master.quit()


choices = ['Python', 'JavaScript', 'C++', 'Java']

questions = [
    Question('最初に出た言語は何ですか?', 'Python'),
    Question('Javaの基になった言語は何ですか?', 'C++'),
    Question('最も人気のあるフロントエンドの言語は何ですか?', 'JavaScript'),
]

root = tk.Tk()
Quiz(root, questions, choices)
root.mainloop()
