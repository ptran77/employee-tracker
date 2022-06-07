INSERT INTO
    department(name)
VALUES
    ('Development'),
    ('Marketing'),
    ('Sales');

INSERT INTO
    role(title, salary, department_id)
VALUES
    ('Engineer', 90000, 1),
    ('Project Leader', 150000, 1),
    ('Customer Service', 40000, 3);

INSERT INTO
    employee(first_name, last_name, role_id, manager_id)
VALUES
    ('Johnny', 'Lost', 2, null),
    ('Richard', 'Nguyen', 1, 1),
    ('Vicky', 'Kong', 1, 1),
    ('Madison', 'None', 3, null);