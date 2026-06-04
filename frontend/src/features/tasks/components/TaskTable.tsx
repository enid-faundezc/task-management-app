import { type Task } from '../types/task.types';

interface Props {
  tasks: Task[];
}

export const TaskTable = ({ tasks }: Props) => {
  return (
    <table width="100%">
      <thead>
        <tr>
          <th>Title</th>
          <th>Status</th>
          <th>Priority</th>
        </tr>
      </thead>

      <tbody>
        {tasks?.map((task) => (
          <tr key={task.id}>
            <td>{task.title}</td>
            <td>{task.status}</td>
            <td>{task.priority}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};