class Goal {
    constructor(description) {
      this.description = description;
    }
  }
  
  class UserInterface {
    constructor() {
      this.buttonInput = document.getElementById("create-goal-button");
      this.goalInput = document.getElementById("goal-input");
      this.tableBody = document.getElementById("goals-table-body");
      this.goals = [];
    }
  
    bindEventListeners() {
      this.buttonInput.addEventListener('click', (event) => {
        this.createGoal(event);
        this.goalInput.value = ' ';
      })
    }
  
    createGoal() {
      // create a new Goal object
      const newGoal = new Goal(this.goalInput.value);
      this.goals.push(newGoal);
      const newRow = document.createElement('tr');
      const goalDescription = document.createElement('td');
      const compLeteGoalBtn = document.createElement('button');
      compLeteGoalBtn.value = 'complete';
      newRow.appendChild(compLeteGoalBtn);
      newRow.appendChild(goalDescription);
      compLeteGoalBtn.addEventListener('click', function() {
        ui.removeGoal(newRow);
      });
      goalDescription.innerHTML = newGoal.description;
      this.tableBody.appendChild(newRow);
    }

    removeGoal(goal) {
        this.tableBody.removeChild(goal);
    }
  }
  
  const ui = new UserInterface();
  ui.bindEventListeners();