import XLSX from 'xlsx';

// Configuration
const config = [
  ['Parameter', 'Value'],
  ['Working Days', 6],
  ['Periods Per Day', 7],
  ['Break Period', 4],
  ['Allow Consecutive Regular', 'Yes'],
];

// All 25 Classes
const classes = [
  [1, '3-CSE-A', 10],
  [2, '3-CSE-B', 10],
  [3, '3-CSE-C', 10],
  [4, '3-CS', 10],
  [5, '3-DS', 10],
  [6, '3-AI&ML-A', 10],
  [7, '3-AI&ML-B', 10],
  [8, '2-CSE-A', 10],
  [9, '2-CSE-B', 10],
  [10, '2-CSE-C', 10],
  [11, '2-CSE-D', 10],
  [12, '2-CSE-E', 10],
  [13, '2-CSE-F', 10],
  [14, '2-CSE-G', 10],
  [15, '2-AIML-A', 10],
  [16, '2-AIML-B', 10],
  [17, '2-AIDS-A', 10],
  [18, '2-AIDS-B', 10],
  [19, '4-CSE-A', 7],
  [20, '4-CSE-B', 7],
  [21, '4-CSE-C', 7],
  [22, '4-AIML-A', 7],
  [23, '4-AIML-B', 7],
  [24, '4-CSC', 7],
  [25, '4-CSD', 7],
];

// All Subjects for all 25 classes
const subjects = [
  // Class 1: 3-CSE-A
  [1, 'AI', 'Artificial Intelligence', 'No', 5, '', 'Ms. N. Siva Nagamani'],
  [1, 'AI_LAB', 'AI LAB', 'Yes', 1, 3, 'Ms. N. Siva Nagamani'],
  [1, 'CN', 'Computer Networks', 'No', 6, '', 'Ms. N. Divya Sruthi'],
  [1, 'CN_LAB', 'CN LAB', 'Yes', 1, 3, 'Ms. R. Deepthi'],
  [1, 'ATCD', 'Automata Theory & Compiler Design', 'No', 6, '', 'Dr. N. Sai Sindhuri'],
  [1, 'OOAD', 'Object Oriented Analysis & Design', 'No', 5, '', 'Ms. P. Sravani'],
  [1, 'FSD2_LAB', 'FSD-II LAB', 'Yes', 1, 3, 'Mr. S. Hari Krishna'],
  [1, 'TL_LAB', 'TL LAB', 'Yes', 1, 2, 'Ms. E. Sireesha'],
  [1, 'ESPS', 'Environmental Studies & Professional Skills', 'No', 5, '', 'Mr. G. Seenaiah'],
  [1, 'IQTA', 'Indian Knowledge Tradition & Aptitude', 'No', 4, '', 'Ms. K. Sree Lakshmi'],
  
  // Class 2: 3-CSE-B
  [2, 'AI', 'Artificial Intelligence', 'No', 5, '', 'Ms. N. Siva Nagamani'],
  [2, 'AI_LAB', 'AI LAB', 'Yes', 1, 3, 'Mr. K. Bala Krishna'],
  [2, 'CN', 'Computer Networks', 'No', 5, '', 'Ms. N. Divya Sruthi'],
  [2, 'CN_LAB', 'CN LAB', 'Yes', 1, 3, 'Ms. V. Bharathi'],
  [2, 'ATCD', 'Automata Theory & Compiler Design', 'No', 6, '', 'Dr. N. Sai Sindhuri'],
  [2, 'OOAD', 'Object Oriented Analysis & Design', 'No', 6, '', 'Ms. P. Sravani'],
  [2, 'FSD2_LAB', 'FSD-II LAB', 'Yes', 1, 3, 'Mr. S. Hari Krishna'],
  [2, 'TL_LAB', 'TL LAB', 'Yes', 1, 2, 'Ms. R. Selvi'],
  [2, 'ESPS', 'Environmental Studies & Professional Skills', 'No', 4, '', 'Mr. G. Seenaiah'],
  [2, 'IQTA', 'Indian Knowledge Tradition & Aptitude', 'No', 5, '', 'Ms. K. Sree Lakshmi'],
  
  // Class 3: 3-CSE-C
  [3, 'AI', 'Artificial Intelligence', 'No', 6, '', 'Mr. K. Bala Krishna'],
  [3, 'AI_LAB', 'AI LAB', 'Yes', 1, 3, 'Mr. K. Bala Krishna'],
  [3, 'CN', 'Computer Networks', 'No', 6, '', 'Ms. N. Divya Sruthi'],
  [3, 'CN_LAB', 'CN LAB', 'Yes', 1, 3, 'Ms. N. Divya Sruthi'],
  [3, 'ATCD', 'Automata Theory & Compiler Design', 'No', 5, '', 'Dr. N. Sai Sindhuri'],
  [3, 'OOAD', 'Object Oriented Analysis & Design', 'No', 6, '', 'Mr. T. Harsha Vardhan'],
  [3, 'FSD2_LAB', 'FSD-II LAB', 'Yes', 1, 3, 'Mr. S. Hari Krishna'],
  [3, 'TL_LAB', 'TL LAB', 'Yes', 1, 2, 'Mr. Y. Srujan'],
  [3, 'ESPS', 'Environmental Studies & Professional Skills', 'No', 4, '', 'Ms. Ch. Silpi Priyanka'],
  [3, 'IQTA', 'Indian Knowledge Tradition & Aptitude', 'No', 4, '', 'Ms. K. Sree Lakshmi'],
  
  // Class 4: 3-CS
  [4, 'CC', 'Cloud Computing', 'No', 5, '', 'Mr. D. Ramesh'],
  [4, 'CC_LAB', 'Cloud Computing LAB', 'Yes', 1, 3, 'Mr. D. Ramesh'],
  [4, 'ICS', 'Information & Cyber Security', 'No', 5, '', 'Ms. B. Poojitha'],
  [4, 'CS_LAB', 'Cyber Security LAB', 'Yes', 1, 3, 'Ms. B. Poojitha'],
  [4, 'ATCD', 'Automata Theory & Compiler Design', 'No', 6, '', 'Mr. Y. V. Ramesh'],
  [4, 'SE', 'Software Engineering', 'No', 5, '', 'Mr. B. Ramamurthi'],
  [4, 'FSD2_LAB', 'FSD-II LAB', 'Yes', 1, 3, 'Mr. S. Hari Krishna'],
  [4, 'TL_LAB', 'TL LAB', 'Yes', 1, 2, 'Mr. M. Bharath'],
  [4, 'ESPS', 'Environmental Studies & Professional Skills', 'No', 4, '', 'Ms. G. Vasundhara'],
  [4, 'IQTA', 'Indian Knowledge Tradition & Aptitude', 'No', 4, '', 'Mr. A. Ramesh'],
  
  // Class 5: 3-DS
  [5, 'ML', 'Machine Learning', 'No', 6, '', 'Mr. B. Ramamurthi'],
  [5, 'ML_LAB', 'Machine Learning LAB', 'Yes', 1, 3, 'Mr. B. Ramamurthi'],
  [5, 'OS', 'Operating Systems', 'No', 6, '', 'Mr. M. Venkateswarlu'],
  [5, 'OS_LAB', 'Operating Systems LAB', 'Yes', 1, 3, 'Mr. M. Venkateswarlu'],
  [5, 'SE', 'Software Engineering', 'No', 5, '', 'Mr. A. Sunil Kumar'],
  [5, 'FSD2_LAB', 'FSD-II LAB', 'Yes', 1, 3, 'Mr. S. Hari Krishna'],
  [5, 'TL_LAB', 'TL LAB', 'Yes', 1, 2, 'Mr. D. Masthanaiah'],
  [5, 'OOAD', 'Object Oriented Analysis & Design', 'No', 5, '', 'Mr. T. Harsha Vardhan'],
  [5, 'ESPS', 'Environmental Studies & Professional Skills', 'No', 4, '', 'Ms. G. Vasundhara'],
  [5, 'IQTA', 'Indian Knowledge Tradition & Aptitude', 'No', 4, '', 'Mr. A. Ramesh'],
  
  // Class 6: 3-AI&ML-A
  [6, 'NLP', 'Natural Language Processing', 'No', 6, '', 'Ms. V. Bharathi'],
  [6, 'CVML_LAB', 'Computer Vision & ML LAB', 'Yes', 1, 3, 'Mr. P. Nagendra Kumar'],
  [6, 'OSSP', 'Operating Systems & System Programming', 'No', 6, '', 'Mr. K. Venkateswarlu'],
  [6, 'AISP_LAB', 'AI & System Programming LAB', 'Yes', 1, 3, 'Mr. K. Venkateswarlu'],
  [6, 'CVIP', 'Computer Vision & Image Processing', 'No', 6, '', 'Dr. P. Nagendra Kumar'],
  [6, 'FSD2_LAB', 'FSD-II LAB', 'Yes', 1, 3, 'Mr. S. Hari Krishna'],
  [6, 'TL_LAB', 'TL LAB', 'Yes', 1, 2, 'Ms. SK. Sumeera'],
  [6, 'DV', 'Data Visualization', 'No', 5, '', 'Ms. Teesa Davis'],
  [6, 'ESPS', 'Environmental Studies & Professional Skills', 'No', 4, '', 'Mr. P. Naga Kondaiah'],
  [6, 'IQTA', 'Indian Knowledge Tradition & Aptitude', 'No', 4, '', 'Ms. N. Siva Nagamani'],
  
  // Class 7: 3-AI&ML-B
  [7, 'NLP', 'Natural Language Processing', 'No', 6, '', 'Ms. V. Bharathi'],
  [7, 'CVML_LAB', 'Computer Vision & ML LAB', 'Yes', 1, 3, 'Mr. P. Nagendra Kumar'],
  [7, 'OSSP', 'Operating Systems & System Programming', 'No', 6, '', 'Mr. K. Venkateswarlu'],
  [7, 'AISP_LAB', 'AI & System Programming LAB', 'Yes', 1, 3, 'Mr. K. Venkateswarlu'],
  [7, 'CVIP', 'Computer Vision & Image Processing', 'No', 6, '', 'Dr. P. Nagendra Kumar'],
  [7, 'FSD2_LAB', 'FSD-II LAB', 'Yes', 1, 3, 'Mr. S. Hari Krishna'],
  [7, 'TL_LAB', 'TL LAB', 'Yes', 1, 2, 'Ms. SK. Sumeera'],
  [7, 'DV', 'Data Visualization', 'No', 5, '', 'Ms. Teesa Davis'],
  [7, 'ESPS', 'Environmental Studies & Professional Skills', 'No', 4, '', 'Mr. P. Naga Kondaiah'],
  [7, 'IQTA', 'Indian Knowledge Tradition & Aptitude', 'No', 4, '', 'Mr. A. Ramesh'],
  
  // Class 8: 2-CSE-A
  [8, 'DMGT', 'Discrete Mathematics & Graph Theory', 'No', 6, '', 'Mr. K. Sudheer'],
  [8, 'PP', 'Professional Practices', 'No', 5, '', 'Ms. A. Pavani'],
  [8, 'UHV', 'Universal Human Values', 'No', 2, '', 'Ms. L. Sasirlatha'],
  [8, 'ES', 'Environmental Science', 'No', 1, '', 'Mr. P. Sudhkar'],
  [8, 'DLCO', 'Digital Logic & Computer Organization', 'No', 5, '', 'Mr. G. Surendra'],
  [8, 'ADSA', 'Advanced Data Structures & Algorithms', 'No', 5, '', 'Dr. T. Chalama Reddy'],
  [8, 'OOPS', 'Object Oriented Programming with Java', 'No', 6, '', 'Mr. Sk. Asiff'],
  [8, 'ABL', 'Ability Enhancement Lab', 'No', 1, '', 'Ms. N. Siva Nagamani'],
  [8, 'ADSA_LAB', 'ADSA LAB', 'Yes', 1, 3, 'Dr. T. Chalama Reddy'],
  [8, 'OOPJ_LAB', 'OOPJ LAB', 'Yes', 1, 3, 'Mr. Sk. Asiff'],
  
  // Class 9: 2-CSE-B
  [9, 'DMGT', 'Discrete Mathematics & Graph Theory', 'No', 6, '', 'Mr. K. Sudheer'],
  [9, 'PP', 'Professional Practices', 'No', 5, '', 'Ms. A. Pavani'],
  [9, 'UHV', 'Universal Human Values', 'No', 2, '', 'Ms. L. Sasirlatha'],
  [9, 'ES', 'Environmental Science', 'No', 1, '', 'Mr. P. Sudhkar'],
  [9, 'DLCO', 'Digital Logic & Computer Organization', 'No', 5, '', 'Ms. Sk. Arifa'],
  [9, 'ADSA', 'Advanced Data Structures & Algorithms', 'No', 5, '', 'Dr. T. Chalama Reddy'],
  [9, 'OOPS', 'Object Oriented Programming with Java', 'No', 6, '', 'Mr. K. Chiranjeevi'],
  [9, 'ABL', 'Ability Enhancement Lab', 'No', 1, '', 'Ms. Teesa Davis'],
  [9, 'ADSA_LAB', 'ADSA LAB', 'Yes', 1, 3, 'Ms. G. Sukanya'],
  [9, 'OOPJ_LAB', 'OOPJ LAB', 'Yes', 1, 3, 'Mr. K. Chiranjeevi'],
  
  // Class 10: 2-CSE-C
  [10, 'DMGT', 'Discrete Mathematics & Graph Theory', 'No', 6, '', 'Ms. R. Deepthi'],
  [10, 'PP', 'Professional Practices', 'No', 5, '', 'Ms. A. Pavani'],
  [10, 'UHV', 'Universal Human Values', 'No', 2, '', 'Ms. L. Sasirlatha'],
  [10, 'ES', 'Environmental Science', 'No', 1, '', 'Ms. B. Sravanthi'],
  [10, 'DLCO', 'Digital Logic & Computer Organization', 'No', 5, '', 'Mr. G. Surendra'],
  [10, 'ADSA', 'Advanced Data Structures & Algorithms', 'No', 5, '', 'Dr. T. Chalama Reddy'],
  [10, 'OOPS', 'Object Oriented Programming with Java', 'No', 6, '', 'Mr. K. Chiranjeevi'],
  [10, 'ABL', 'Ability Enhancement Lab', 'No', 1, '', 'Ms. R. Deepthi'],
  [10, 'ADSA_LAB', 'ADSA LAB', 'Yes', 1, 3, 'Ms. G. Sukanya'],
  [10, 'OOPJ_LAB', 'OOPJ LAB', 'Yes', 1, 3, 'Mr. Y. V. Ramesh'],
  
  // Class 11: 2-CSE-D
  [11, 'DMGT', 'Discrete Mathematics & Graph Theory', 'No', 6, '', 'Ms. Mazolin'],
  [11, 'PP', 'Professional Practices', 'No', 5, '', 'Ms. A. Pavani'],
  [11, 'UHV', 'Universal Human Values', 'No', 2, '', 'Ms. L. Sasirlatha'],
  [11, 'ES', 'Environmental Science', 'No', 1, '', 'Ms. B. Sravanthi'],
  [11, 'DLCO', 'Digital Logic & Computer Organization', 'No', 5, '', 'Mr. P. Sukumar'],
  [11, 'ADSA', 'Advanced Data Structures & Algorithms', 'No', 5, '', 'Dr. V. Gayatri'],
  [11, 'OOPS', 'Object Oriented Programming with Java', 'No', 6, '', 'Mr. K. Chiranjeevi'],
  [11, 'ABL', 'Ability Enhancement Lab', 'No', 1, '', 'Mr. D. Ramesh'],
  [11, 'ADSA_LAB', 'ADSA LAB', 'Yes', 1, 3, 'Dr. V. Gayatri'],
  [11, 'OOPJ_LAB', 'OOPJ LAB', 'Yes', 1, 3, 'Mr. Y. V. Ramesh'],
  
  // Class 12: 2-CSE-E
  [12, 'DMGT', 'Discrete Mathematics & Graph Theory', 'No', 6, '', 'Ms. Mazolin'],
  [12, 'PP', 'Professional Practices', 'No', 5, '', 'Ms. A. Pavani'],
  [12, 'UHV', 'Universal Human Values', 'No', 2, '', 'Ms. L. Sasirlatha'],
  [12, 'ES', 'Environmental Science', 'No', 1, '', 'Mr. B. Manohar Babu'],
  [12, 'DLCO', 'Digital Logic & Computer Organization', 'No', 5, '', 'Ms. M. Suhasini'],
  [12, 'ADSA', 'Advanced Data Structures & Algorithms', 'No', 5, '', 'Dr. V. Gayatri'],
  [12, 'OOPS', 'Object Oriented Programming with Java', 'No', 6, '', 'Ms. S. Sahaja'],
  [12, 'ABL', 'Ability Enhancement Lab', 'No', 1, '', 'Mr. P. Naresh'],
  [12, 'ADSA_LAB', 'ADSA LAB', 'Yes', 1, 3, 'Dr. V. Gayatri'],
  [12, 'OOPJ_LAB', 'OOPJ LAB', 'Yes', 1, 3, 'Ms. S. Sahaja'],
  
  // Class 13: 2-CSE-F
  [13, 'DMGT', 'Discrete Mathematics & Graph Theory', 'No', 6, '', 'Mr. K. Sudheer'],
  [13, 'PP', 'Professional Practices', 'No', 5, '', 'Ms. A. Pavani'],
  [13, 'UHV', 'Universal Human Values', 'No', 2, '', 'Ms. L. Sasirlatha'],
  [13, 'ES', 'Environmental Science', 'No', 1, '', 'Mr. Sk. Nayab Rasool'],
  [13, 'DLCO', 'Digital Logic & Computer Organization', 'No', 5, '', 'Mr. Siva'],
  [13, 'ADSA', 'Advanced Data Structures & Algorithms', 'No', 5, '', 'Dr. R. Rajani'],
  [13, 'OOPS', 'Object Oriented Programming with Java', 'No', 6, '', 'Ms. S. Sahaja'],
  [13, 'ABL', 'Ability Enhancement Lab', 'No', 1, '', 'Ms. B. Poojitha'],
  [13, 'ADSA_LAB', 'ADSA LAB', 'Yes', 1, 3, 'Dr. R. Rajani'],
  [13, 'OOPJ_LAB', 'OOPJ LAB', 'Yes', 1, 3, 'Ms. P. Sravani'],
  
  // Class 14: 2-CSE-G
  [14, 'DMGT', 'Discrete Mathematics & Graph Theory', 'No', 6, '', 'Ms. V. Bharathi'],
  [14, 'PP', 'Professional Practices', 'No', 5, '', 'Ms. Sk. Rakheeba'],
  [14, 'UHV', 'Universal Human Values', 'No', 2, '', 'Ms. L. Sasirlatha'],
  [14, 'ES', 'Environmental Science', 'No', 1, '', 'Mr. B. Manohar Babu'],
  [14, 'DLCO', 'Digital Logic & Computer Organization', 'No', 5, '', 'Mr. Siva'],
  [14, 'ADSA', 'Advanced Data Structures & Algorithms', 'No', 5, '', 'Dr. R. Rajani'],
  [14, 'OOPS', 'Object Oriented Programming with Java', 'No', 6, '', 'Ms. S. Sahaja'],
  [14, 'ABL', 'Ability Enhancement Lab', 'No', 1, '', 'Ms. N. Siva Nagamani'],
  [14, 'ADSA_LAB', 'ADSA LAB', 'Yes', 1, 3, 'Dr. R. Rajani'],
  [14, 'OOPJ_LAB', 'OOPJ LAB', 'Yes', 1, 3, 'Ms. P. Sravani'],
  
  // Class 15: 2-AIML-A
  [15, 'DMGT', 'Discrete Mathematics & Graph Theory', 'No', 6, '', 'Mr. K. Sudheer'],
  [15, 'PP', 'Professional Practices', 'No', 5, '', 'Ms. Sk. Rakheeba'],
  [15, 'UHV', 'Universal Human Values', 'No', 2, '', 'Ms. L. Sasirlatha'],
  [15, 'ES', 'Environmental Science', 'No', 1, '', 'Mr. Sk. Nayab Rasool'],
  [15, 'ADSA', 'Advanced Data Structures & Algorithms', 'No', 5, '', 'Dr. T. Chalama Reddy'],
  [15, 'OOPS', 'Object Oriented Programming with Java', 'No', 6, '', 'Ms. M. Lakshmi'],
  [15, 'ABL', 'Ability Enhancement Lab', 'No', 1, '', 'Ms. R. Deepthi'],
  [15, 'ADSA_LAB', 'ADSA LAB', 'Yes', 1, 3, 'Dr. T. Chalama Reddy'],
  [15, 'OOPJ_LAB', 'OOPJ LAB', 'Yes', 1, 3, 'Mr. Sk. Asiff'],
  [15, 'AI', 'Artificial Intelligence', 'No', 6, '', 'Mr. K. Bala Krishna'],
  
  // Class 16: 2-AIML-B
  [16, 'DMGT', 'Discrete Mathematics & Graph Theory', 'No', 6, '', 'Ms. R. Deepthi'],
  [16, 'PP', 'Professional Practices', 'No', 5, '', 'Mr. Sk. Khaja Rasool'],
  [16, 'UHV', 'Universal Human Values', 'No', 2, '', 'Ms. L. Sasirlatha'],
  [16, 'ES', 'Environmental Science', 'No', 1, '', 'Mr. P. Sudhkar'],
  [16, 'ADSA', 'Advanced Data Structures & Algorithms', 'No', 5, '', 'Mr. P. Naresh'],
  [16, 'OOPS', 'Object Oriented Programming with Java', 'No', 6, '', 'Ms. M. Lakshmi'],
  [16, 'ABL', 'Ability Enhancement Lab', 'No', 1, '', 'Ms. N. Siva Nagamani'],
  [16, 'ADSA_LAB', 'ADSA LAB', 'Yes', 1, 3, 'Mr. P. Naresh'],
  [16, 'OOPJ_LAB', 'OOPJ LAB', 'Yes', 1, 3, 'Ms. M. Lakshmi'],
  [16, 'AI', 'Artificial Intelligence', 'No', 6, '', 'Mr. K. Bala Krishna'],
  
  // Class 17: 2-AIDS-A
  [17, 'DMGT', 'Discrete Mathematics & Graph Theory', 'No', 6, '', 'Ms. Mazolin'],
  [17, 'PP', 'Professional Practices', 'No', 5, '', 'Mr. Sk. Khaja Rasool'],
  [17, 'UHV', 'Universal Human Values', 'No', 2, '', 'Ms. L. Sasirlatha'],
  [17, 'ES', 'Environmental Science', 'No', 1, '', 'Mr. B. Manohar Babu'],
  [17, 'DBMS', 'Database Management Systems', 'No', 5, '', 'Dr. P. Babu'],
  [17, 'ADSA', 'Advanced Data Structures & Algorithms', 'No', 5, '', 'Ms. CH. Vasavi'],
  [17, 'OOPS', 'Object Oriented Programming with Java', 'No', 6, '', 'Ms. I. Shalini'],
  [17, 'ABL', 'Ability Enhancement Lab', 'No', 1, '', 'Ms. Teesa Davis'],
  [17, 'ADSA_LAB', 'ADSA LAB', 'Yes', 1, 3, 'Ms. CH. Vasavi'],
  [17, 'OOPJ_LAB', 'OOPJ LAB', 'Yes', 1, 3, 'Ms. I. Shalini'],
  
  // Class 18: 2-AIDS-B
  [18, 'DMGT', 'Discrete Mathematics & Graph Theory', 'No', 6, '', 'Ms. R. Deepthi'],
  [18, 'PP', 'Professional Practices', 'No', 5, '', 'Mr. Sk. Khaja Rasool'],
  [18, 'UHV', 'Universal Human Values', 'No', 2, '', 'Ms. L. Sasirlatha'],
  [18, 'ES', 'Environmental Science', 'No', 1, '', 'Ms. B. Sravanthi'],
  [18, 'DBMS', 'Database Management Systems', 'No', 5, '', 'Dr. P. Babu'],
  [18, 'ADSA', 'Advanced Data Structures & Algorithms', 'No', 5, '', 'Ms. CH. Vasavi'],
  [18, 'OOPS', 'Object Oriented Programming with Java', 'No', 6, '', 'Ms. I. Shalini'],
  [18, 'ABL', 'Ability Enhancement Lab', 'No', 1, '', 'Ms. I. Shalini'],
  [18, 'ADSA_LAB', 'ADSA LAB', 'Yes', 1, 3, 'Ms. CH. Vasavi'],
  [18, 'OOPJ_LAB', 'OOPJ LAB', 'Yes', 1, 3, 'Ms. I. Shalini'],
  
  // Class 19: 4-CSE-A
  [19, 'MS', 'Management Science', 'No', 5, '', 'Mr. K. Sreenivasula Reddy'],
  [19, 'DM', 'Data Mining', 'No', 6, '', 'Ms. M. Satyavathi'],
  [19, 'SPM', 'Software Project Management', 'No', 6, '', 'Mr. E. Chitti Babu'],
  [19, 'IR', 'Information Retrieval', 'No', 5, '', 'Dr. G. Subba Rao'],
  [19, 'AM', 'Advanced Microprocessors', 'No', 5, '', 'Ms. D. Apeksha'],
  [19, 'DP', 'Design Patterns', 'No', 5, '', 'Ms. B. Varalakshmi'],
  [19, 'MAD_SKILL', 'MAD SKILL', 'No', 1, '', 'Mr. A. Sunil Kumar'],
  
  // Class 20: 4-CSE-B
  [20, 'MS', 'Management Science', 'No', 5, '', 'Mr. K. Sreenivasula Reddy'],
  [20, 'DM', 'Data Mining', 'No', 6, '', 'Mr. V. Radha Krishna'],
  [20, 'SPM', 'Software Project Management', 'No', 6, '', 'Mr. E. Chitti Babu'],
  [20, 'IR', 'Information Retrieval', 'No', 5, '', 'Dr. G. Subba Rao'],
  [20, 'AM', 'Advanced Microprocessors', 'No', 5, '', 'Ms. D. Apeksha'],
  [20, 'DP', 'Design Patterns', 'No', 5, '', 'Ms. B. Varalakshmi'],
  [20, 'MAD_SKILL', 'MAD SKILL', 'No', 1, '', 'Mr. A. Sunil Kumar'],
  
  // Class 21: 4-CSE-C
  [21, 'MS', 'Management Science', 'No', 5, '', 'Mr. K. Sreenivasula Reddy'],
  [21, 'DM', 'Data Mining', 'No', 6, '', 'Mr. Sk. Habeeb Basha'],
  [21, 'SPM', 'Software Project Management', 'No', 6, '', 'Mr. E. Chitti Babu'],
  [21, 'IR', 'Information Retrieval', 'No', 5, '', 'Mr. Vara Prasad'],
  [21, 'AM', 'Advanced Microprocessors', 'No', 5, '', 'Ms. D. Apeksha'],
  [21, 'DP', 'Design Patterns', 'No', 5, '', 'Ms. B. Varalakshmi'],
  [21, 'MAD_SKILL', 'MAD SKILL', 'No', 1, '', 'Mr. A. Sunil Kumar'],
  
  // Class 22: 4-AIML-A
  [22, 'MS', 'Management Science', 'No', 5, '', 'Ms. D. Suma Lalitha'],
  [22, 'DM', 'Data Mining', 'No', 6, '', 'Mr. Sk. Habeeb Basha'],
  [22, 'SPM', 'Software Project Management', 'No', 6, '', 'Ms. Shanthi'],
  [22, 'IR', 'Information Retrieval', 'No', 5, '', 'Mr. V. Ramu'],
  [22, 'DS', 'Data Science', 'No', 5, '', 'Ms. Sk. Rakheeba'],
  [22, 'BDT', 'Big Data Technologies', 'No', 5, '', 'Mr. Sk. Asiff'],
  [22, 'GEN_AI', 'Generative AI', 'No', 1, '', 'Mr. T. Harsha Vardhan'],
  
  // Class 23: 4-AIML-B
  [23, 'MS', 'Management Science', 'No', 5, '', 'Ms. D. Suma Lalitha'],
  [23, 'DM', 'Data Mining', 'No', 6, '', 'Mr. V. Radha Krishna'],
  [23, 'SPM', 'Software Project Management', 'No', 6, '', 'Ms. Shanthi'],
  [23, 'IR', 'Information Retrieval', 'No', 5, '', 'Mr. Vara Prasad'],
  [23, 'DS', 'Data Science', 'No', 5, '', 'Ms. Sk. Rakheeba'],
  [23, 'BDT', 'Big Data Technologies', 'No', 5, '', 'Mr. Sk. Asiff'],
  [23, 'GEN_AI', 'Generative AI', 'No', 1, '', 'Mr. T. Harsha Vardhan'],
  
  // Class 24: 4-CSC
  [24, 'MS', 'Management Science', 'No', 5, '', 'Dr. P. Chakrapani'],
  [24, 'DM', 'Data Mining', 'No', 6, '', 'Mr. D. Pavan Kumar'],
  [24, 'SPM', 'Software Project Management', 'No', 6, '', 'Mr. A. Sunil Kumar'],
  [24, 'IR', 'Information Retrieval', 'No', 5, '', 'Mr. V. Ramu'],
  [24, 'AM', 'Advanced Microprocessors', 'No', 5, '', 'Mr. V. Chaithanya'],
  [24, 'DP', 'Design Patterns', 'No', 5, '', 'Mr. T. Sai Prasad Reddy'],
  [24, 'R_PROG', 'R Programming', 'No', 1, '', 'Mr. A. Ramesh'],
  
  // Class 25: 4-CSD
  [25, 'MS', 'Management Science', 'No', 5, '', 'Mr. K. Sreenivasula Reddy'],
  [25, 'DM', 'Data Mining', 'No', 6, '', 'Ms. M. Satyavathi'],
  [25, 'SPM', 'Software Project Management', 'No', 6, '', 'Mr. E. Chitti Babu'],
  [25, 'IR', 'Information Retrieval', 'No', 5, '', 'Dr. G. Subba Rao'],
  [25, 'AM', 'Advanced Microprocessors', 'No', 5, '', 'Ms. D. Apeksha'],
  [25, 'DP', 'Design Patterns', 'No', 5, '', 'Ms. B. Varalakshmi'],
  [25, 'MAD_SKILL', 'MAD SKILL', 'No', 1, '', 'Mr. A. Sunil Kumar'],
];

// Create workbook
const wb = XLSX.utils.book_new();

// Add headers
const configWithHeader = [['Parameter', 'Value'], ...config];
const classWithHeader = [['Class ID', 'Class Name', 'Number of Subjects'], ...classes];
const subjectsWithHeader = [
  ['Class ID', 'Subject Code', 'Subject Name', 'Is Lab', 'Periods Per Week', 'Lab Slots', 'Teacher Name'],
  ...subjects
];

// Create sheets
const wsConfig = XLSX.utils.aoa_to_sheet(configWithHeader);
const wsClasses = XLSX.utils.aoa_to_sheet(classWithHeader);
const wsSubjects = XLSX.utils.aoa_to_sheet(subjectsWithHeader);

// Append sheets to workbook
XLSX.utils.book_append_sheet(wb, wsConfig, 'Configuration');
XLSX.utils.book_append_sheet(wb, wsClasses, 'Classes');
XLSX.utils.book_append_sheet(wb, wsSubjects, 'Subjects');

// Write file
XLSX.writeFile(wb, 'College_Timetable_Data.xlsx');

console.log('✅ Excel file created: College_Timetable_Data.xlsx');
console.log(`📊 Total classes: ${classes.length}`);
console.log(`📚 Total subjects: ${subjects.length}`);
