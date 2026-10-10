import TodoForm from "../components/TodoForm";

function TasksView({ app }) {
  return (
    <div className="view tasks-view">
      <TodoForm
        text={app.text}
        onTextChange={app.setText}
        onAdd={app.addTodo}
        newColor={app.newColor}
        onPickColor={app.pickColor}
        dueDate={app.dueDate}
        dueTime={app.dueTime}
        remind={app.remind}
        repeat={app.repeat}
        listItems={app.listItems}
        onStageItem={app.stageItem}
        onUpdateStagedItem={app.updateStagedItem}
        onRemoveStagedItem={app.removeStagedItem}
        isEditingList={app.isEditingList}
        onCancel={app.cancelListEdit}
        onDueDateChange={app.setDueDate}
        onDueTimeChange={app.setDueTime}
        onRemindChange={app.setRemind}
        onRepeatChange={app.setRepeat}
      />
    </div>
  );
}

export default TasksView;
