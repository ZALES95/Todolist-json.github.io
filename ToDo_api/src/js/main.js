const input = document.querySelector(".todo-input")
const priorityList = document.querySelector("#priority-list")
const addBtn = document.querySelector(".btn-add")
const errorInfo = document.querySelector(".error-info")
const ulList = document.querySelector("ul")
const popup = document.querySelector(".popup")
const popupInfo = document.querySelector(".popup-info")
const popupInput = document.querySelector(".popup-input")
const popupAddBtn = document.querySelector(".accept")
const popupCloseBtn = document.querySelector(".cancel")
const popupPriority = document.querySelector("#popup-priority-list")

let tools
let newLi
let todoToEdit
let previousPriority

class TodoList {
	constructor(baseUrl) {
		this.baseUrl = baseUrl
		this.lastId = 0
	}

	async getAll() {
		const response = await fetch(`${this.baseUrl}`, {
			method: "GET",
		})
		const data = await response.json()
		this.lastId = data.length > 0 ? data[data.length - 1].id : 0
		return data
	}

	async addTask(title, priority) {
		const info = {
			title: title,
			isDone: false,
			priority: priority,
		}

		const response = await fetch(`${this.baseUrl}`, {
			headers: {
				"Content-Type": "application/json",
			},
			method: "POST",
			body: JSON.stringify(info),
		})
		const data = await response.json()
		this.lastId = data.id
		return data
	}

	async removeTask(id) {
		const response = await fetch(`${this.baseUrl}/${id}`, {
			method: "DELETE",
		})
		const data = await response.json()
		return data
	}

	async changeToDone(id) {
		const baseRes = await fetch(`${this.baseUrl}/${id}`)
		const baseData = await baseRes.json()
		if (baseData.isDone === true) {
			baseData.isDone = false
		} else {
			baseData.isDone = true
		}

		const response = await fetch(`${this.baseUrl}/${id}`, {
			headers: {
				"Content-Type": "application/json",
			},
			method: "PUT",
			body: JSON.stringify(baseData),
		})
		const data = await response.json()

		return data
	}

	async editTitle(id, newTitle) {
		const baseRes = await fetch(`${this.baseUrl}/${id}`)
		const baseData = await baseRes.json()

		baseData.title = newTitle

		const response = await fetch(`${this.baseUrl}/${id}`, {
			headers: {
				"Content-Type": "application/json",
			},
			method: "PUT",
			body: JSON.stringify(baseData),
		})

		const data = await response.json()
		return data
	}

	async editPriority(id, newPriority) {
		const baseRes = await fetch(`${this.baseUrl}/${id}`)
		const baseData = await baseRes.json()

		baseData.priority = newPriority

		const response = await fetch(`${this.baseUrl}/${id}`, {
			headers: {
				"Content-Type": "application/json",
			},
			method: "PUT",
			body: JSON.stringify(baseData),
		})

		const data = await response.json()
		return data
	}
}

// example of array

// const todolistObj = [
// 	{ id: 1, title: "test title", priority: "low", isDone: false },
// 	{ id: 2, title: "cat", priority: "high", isDone: false },
// 	{ id: 3, title: "dog", priority: "medium", isDone: false },
// ]

const todo = new TodoList("http://localhost:3000/todolist")

const createTools = (title, id, priority) => {
	newLi = document.createElement("li")
	newLi.textContent = title
	newLi.setAttribute("id", id)
	switch (priority) {
		case "low":
			newLi.style.color = ""
			break
		case "medium":
			newLi.classList.add("mid-important")
			break
		case "high":
			newLi.classList.add("important")
			break
	}
	tools = document.createElement("div")
	tools.classList.add("tools")
	tools.innerHTML = `<button class="complete"><i class="fas fa-check"></i></button>
          <button class="edit"><i class="fa-solid fa-pen-to-square"></i></button>
          <button class="delete"><i class="fas fa-times"></i></button>`
	newLi.appendChild(tools)
	ulList.appendChild(newLi)
}

async function renderTasks() {
	const allTasks = await todo.getAll()

	for (let i = 0; i < allTasks.length; i++) {
		const taskToRender = allTasks[i]

		createTools(taskToRender.title, taskToRender.id, taskToRender.priority)

		if (taskToRender.isDone) {
			newLi.classList.add("completed")
		}
	}
}

const addingTask = () => {
	if (
		input.value !== "" &&
		input.value.length > 3 &&
		input.value.length < 100
	) {
		todo.addTask(
			input.value,
			priorityList.options[priorityList.selectedIndex].text
		)

		createTools(
			input.value,
			todo.lastId + 1,
			priorityList.options[priorityList.selectedIndex].text
		)

		priorityList.selectedIndex = 0
		input.value = ""
		errorInfo.textContent = ""
	} else {
		errorInfo.textContent = "Musisz wpisać treść zadania o prawidłowej długości"
	}
}

const enterKeyCheck = e => {
	if (e.key === "Enter") {
		addingTask()
	}
}

const checkTaskIcon = e => {
	if (e.target.matches(".complete")) {
		completeTask(e)
	} else if (e.target.matches(".edit")) {
		editTask(e)
	} else if (e.target.matches(".delete")) {
		removingTask(e)
	}
}

const removingTask = e => {
	let idToDelete = e.target.closest("li").getAttribute("id")
	idToDelete = parseInt(idToDelete)
	console.log(idToDelete)
	todo.removeTask(idToDelete)
	ulList.removeChild(e.target.closest("li"))
	let liNumber = ulList.getElementsByTagName("li")
	if (liNumber.length === 0) {
		errorInfo.textContent = "Brak zadań na liście."
	}
}

const completeTask = e => {
	let idToDelete = e.target.closest("li").getAttribute("id")
	idToDelete = parseInt(idToDelete)
	todo.changeToDone(idToDelete)
	e.target.closest("li").classList.toggle("completed")
}

const editTask = e => {
	popup.style.display = "flex"
	todoToEdit = e.target.closest("li")
	popupInput.value = todoToEdit.innerText
	if (todoToEdit.classList.contains("important")) {
		popupPriority.selectedIndex = 2
	} else if (todoToEdit.classList.contains("mid-important")) {
		popupPriority.selectedIndex = 1
	} else {
		popupPriority.selectedIndex = 0
	}
	previousPriority = popupPriority.selectedIndex
}

const editTitle = () => {
	let idToChange = todoToEdit.getAttribute("id")
	idToChange = parseInt(idToChange)
	if (popupInput.value.length > 3 && popupInput.value.length < 100) {
		todo.editTitle(idToChange, popupInput.value)
		todoToEdit.firstChild.textContent = popupInput.value
		popupInfo.textContent = ""
		popup.style.display = "none"
	} else {
		popupInfo.textContent = "Musisz wpisać treść zadania o prawidłowej długości"
	}
	if (
		previousPriority !== popupPriority.selectedIndex &&
		popupInput.value.length > 3 &&
		popupInput.value.length < 100
	) {
		todo.editPriority(
			idToChange,
			popupPriority.options[popupPriority.selectedIndex].text
		)
		switch (popupPriority.options[popupPriority.selectedIndex].text) {
			case "low":
				todoToEdit.classList.remove("mid-important")
				todoToEdit.classList.remove("important")
				todoToEdit.style.color = ""
				break
			case "medium":
				todoToEdit.classList.remove("important")
				todoToEdit.classList.add("mid-important")
				break
			case "high":
				todoToEdit.classList.remove("mid-important")
				todoToEdit.classList.add("important")
				break
		}
		popupInfo.textContent = ""
		popup.style.display = "none"
	}
}

const enterKeyCheckEdit = e => {
	if (e.key === "Enter") {
		editTitle()
	}
}

const closePopup = () => {
	popupInfo.innertext = ""
	popup.style.display = "none"
}

document.addEventListener("DOMContentLoaded", renderTasks)
addBtn.addEventListener("click", addingTask)
input.addEventListener("keyup", enterKeyCheck)
priorityList.addEventListener("keydown", enterKeyCheck)
ulList.addEventListener("click", checkTaskIcon)
popupAddBtn.addEventListener("click", editTitle)
popupCloseBtn.addEventListener("click", closePopup)
popupInput.addEventListener("keyup", enterKeyCheckEdit)
popupPriority.addEventListener("keydown", enterKeyCheckEdit)
