import type { LessonPlan, ExerciseSet, TeachingScript, DifficultyAnalysis } from './aiService';

export interface ExportOptions {
  includeHeader: boolean;
  includeFooter: boolean;
  fontSize: number;
  orientation: 'portrait' | 'landscape';
}

const defaultOptions: ExportOptions = {
  includeHeader: true,
  includeFooter: true,
  fontSize: 12,
  orientation: 'portrait'
};

function generateWordContent(lessonPlan: LessonPlan, options: ExportOptions = defaultOptions): string {
  const { content } = lessonPlan;

  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${lessonPlan.title}</title>
  <style>
    body {
      font-family: 'SimSun', '宋体', serif;
      font-size: ${options.fontSize}pt;
      line-height: 1.8;
      margin: 40px;
      color: #333;
    }
    h1 {
      text-align: center;
      font-size: ${options.fontSize + 8}pt;
      margin-bottom: 20px;
      border-bottom: 2px solid #333;
      padding-bottom: 10px;
    }
    h2 {
      font-size: ${options.fontSize + 4}pt;
      margin-top: 20px;
      color: #2c3e50;
    }
    h3 {
      font-size: ${options.fontSize + 2}pt;
      margin-top: 15px;
      color: #34495e;
    }
    .objectives {
      background-color: #f8f9fa;
      padding: 15px;
      border-left: 4px solid #3498db;
      margin: 15px 0;
    }
    .objectives ul {
      margin: 5px 0;
      padding-left: 20px;
    }
    .section {
      margin: 20px 0;
      padding: 10px;
      background-color: #fafafa;
      border-radius: 4px;
    }
    .key-points {
      background-color: #e8f4f8;
      padding: 10px;
      margin-top: 10px;
      border-radius: 4px;
    }
    .methods, .resources {
      display: inline-block;
      margin-right: 30px;
    }
    .footer {
      margin-top: 40px;
      text-align: center;
      font-size: ${options.fontSize - 1}pt;
      color: #666;
      border-top: 1px solid #ddd;
      padding-top: 10px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }
    th {
      background-color: #f2f2f2;
    }
  </style>
</head>
<body>
`;

  if (options.includeHeader) {
    html += `
  <h1>${lessonPlan.title}</h1>
  <p><strong>学科：</strong>${lessonPlan.subjectId} | <strong>年级：</strong>${lessonPlan.gradeId} | <strong>课时：</strong>${lessonPlan.duration}分钟</p>
  <p><strong>生成时间：</strong>${new Date(lessonPlan.createdAt).toLocaleString('zh-CN')}</p>
`;
  }

  html += `
  <div class="objectives">
    <h3>教学目标</h3>
    <ul>
      ${lessonPlan.objectives.map(obj => `<li>${obj}</li>`).join('\n      ')}
    </ul>
  </div>

  <h2>教学过程</h2>

  <div class="section">
    <h3>一、课程导入</h3>
    <p>${content.introduction}</p>
  </div>

  <h3>二、新课讲授</h3>
`;

  content.mainContent.forEach((section, index) => {
    html += `
  <div class="section">
    <h4>${index + 1}. ${section.title}（${section.duration}分钟）</h4>
    <p>${section.content}</p>`;
    if (section.keyPoints && section.keyPoints.length > 0) {
      html += `
    <div class="key-points">
      <strong>要点提示：</strong>
      <ul>
        ${section.keyPoints.map(point => `<li>${point}</li>`).join('\n        ')}
      </ul>
    </div>`;
    }
    html += `</div>`;
  });

  html += `
  <div class="section">
    <h3>三、课堂小结</h3>
    <p>${content.summary}</p>
  </div>

  <div class="section">
    <h3>四、课后作业</h3>
    <pre style="white-space: pre-wrap;">${content.homework}</pre>
  </div>

  <h2>教学方法与资源</h2>
  <p>
    <span class="methods"><strong>教学方法：</strong>${lessonPlan.teachingMethods.join('、')}</span>
    <span class="resources"><strong>教学资源：</strong>${lessonPlan.resources.join('、')}</span>
  </p>
`;

  if (options.includeFooter) {
    html += `
  <div class="footer">
    <p>乡村教师智能教学助手 · 智能生成</p>
    <p>本文档由 AI 辅助生成，请根据实际情况调整使用</p>
  </div>
`;
  }

  html += `
</body>
</html>`;

  return html;
}

function generateExerciseContent(exerciseSet: ExerciseSet, options: ExportOptions = defaultOptions): string {
  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${exerciseSet.title}</title>
  <style>
    body {
      font-family: 'SimSun', '宋体', serif;
      font-size: ${options.fontSize}pt;
      line-height: 1.8;
      margin: 40px;
      color: #333;
    }
    h1 {
      text-align: center;
      font-size: ${options.fontSize + 8}pt;
      margin-bottom: 20px;
    }
    .exercise-item {
      margin: 20px 0;
      padding: 15px;
      background-color: #f9f9f9;
      border-radius: 4px;
    }
    .question {
      font-weight: bold;
      margin-bottom: 10px;
    }
    .options {
      margin-left: 20px;
      margin-bottom: 10px;
    }
    .answer {
      color: #27ae60;
      margin-top: 10px;
      padding: 10px;
      background-color: #e8f5e9;
      border-radius: 4px;
    }
    .explanation {
      color: #666;
      font-style: italic;
      margin-top: 5px;
    }
    .difficulty {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: ${options.fontSize - 2}pt;
      margin-left: 10px;
    }
    .difficulty-easy { background-color: #d4edda; color: #155724; }
    .difficulty-medium { background-color: #fff3cd; color: #856404; }
    .difficulty-hard { background-color: #f8d7da; color: #721c24; }
  </style>
</head>
<body>
  <h1>${exerciseSet.title}</h1>
  <p><strong>题目数量：</strong>${exerciseSet.exercises.length}道 | <strong>总分：</strong>${exerciseSet.totalScore}分</p>
  <hr/>
`;

  exerciseSet.exercises.forEach((exercise, index) => {
    const difficultyClass = `difficulty-${exercise.difficulty}`;
    const difficultyLabel = exercise.difficulty === 'easy' ? '简单' : exercise.difficulty === 'medium' ? '中等' : '困难';

    html += `
  <div class="exercise-item">
    <div class="question">
      ${index + 1}. ${exercise.question}
      <span class="difficulty ${difficultyClass}">${difficultyLabel}</span>
    </div>`;

    if (exercise.options) {
      html += `
    <div class="options">
      ${exercise.options.map((opt, i) => `<div>${opt}</div>`).join('\n      ')}
    </div>`;
    }

    html += `
    <div class="answer"><strong>参考答案：</strong>${exercise.answer}</div>
    <div class="explanation">${exercise.explanation}</div>
  </div>`;
  });

  html += `
</body>
</html>`;

  return html;
}

function generateScriptContent(script: TeachingScript, options: ExportOptions = defaultOptions): string {
  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${script.title}</title>
  <style>
    body {
      font-family: 'Microsoft YaHei', '微软雅黑', sans-serif;
      font-size: ${options.fontSize}pt;
      line-height: 1.8;
      margin: 40px;
      color: #333;
    }
    h1 {
      text-align: center;
      font-size: ${options.fontSize + 8}pt;
      margin-bottom: 20px;
    }
    .script-section {
      margin: 25px 0;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
      background-color: #fefefe;
    }
    .phase-title {
      font-size: ${options.fontSize + 3}pt;
      font-weight: bold;
      color: #2c3e50;
      border-bottom: 2px solid #3498db;
      padding-bottom: 8px;
      margin-bottom: 15px;
    }
    .duration {
      float: right;
      color: #7f8c8d;
      font-weight: normal;
      font-size: ${options.fontSize - 1}pt;
    }
    .content {
      white-space: pre-wrap;
      line-height: 2;
      text-indent: 2em;
    }
    .notes {
      margin-top: 15px;
      padding: 10px;
      background-color: #fff3cd;
      border-left: 4px solid #ffc107;
      border-radius: 4px;
      font-style: italic;
      color: #856404;
    }
    .tips-section {
      margin-top: 30px;
      padding: 15px;
      background-color: #e8f4f8;
      border-radius: 8px;
    }
  </style>
</head>
<body>
  <h1>${script.title}</h1>
  <p><strong>教学风格：</strong>${script.style} | <strong>总时长：</strong>${script.sections.reduce((sum, s) => sum + s.duration, 0)}分钟</p>
  <hr/>
`;

  script.sections.forEach((section) => {
    html += `
  <div class="script-section">
    <div class="phase-title">
      ${section.phase}
      <span class="duration">（${section.duration}分钟）</span>
    </div>
    <div class="content">${section.content}</div>`;
    if (section.notes) {
      html += `
    <div class="notes">💡 教学提示：${section.notes}</div>`;
    }
    html += `</div>`;
  });

  html += `
  <div class="tips-section">
    <h3>📌 教学建议</h3>
    <ul>
      ${script.tips.map(tip => `<li>${tip}</li>`).join('\n      ')}
    </ul>
  </div>

</body>
</html>`;

  return html;
}

function generateAnalysisContent(analysis: DifficultyAnalysis, options: ExportOptions = defaultOptions): string {
  const difficultyLabels = { easy: '简单', medium: '中等', hard: '困难' };
  const difficultyColors = { easy: '#27ae60', medium: '#f39c12', hard: '#e74c3c' };

  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${analysis.topic} - 重难点分析</title>
  <style>
    body {
      font-family: 'Microsoft YaHei', '微软雅黑', sans-serif;
      font-size: ${options.fontSize}pt;
      line-height: 1.8;
      margin: 40px;
      color: #333;
    }
    h1 { text-align: center; }
    .difficulty-card {
      margin: 15px 0;
      padding: 20px;
      border-radius: 8px;
      border-left: 5px solid #3498db;
      background-color: #f8f9fa;
    }
    .difficulty-level {
      display: inline-block;
      padding: 3px 12px;
      border-radius: 15px;
      font-size: ${options.fontSize - 1}pt;
      color: white;
    }
    .solution {
      background-color: #e8f5e9;
      padding: 12px;
      margin-top: 10px;
      border-radius: 4px;
    }
    .mistake-card {
      margin: 15px 0;
      padding: 15px;
      background-color: #fff5f5;
      border-radius: 8px;
      border: 1px solid #ffcccc;
    }
    .suggestion-list {
      background-color: #e3f2fd;
      padding: 20px;
      border-radius: 8px;
    }
  </style>
</head>
<body>
  <h1>📊 ${analysis.topic} - 重难点分析报告</h1>
  <hr/>

  <h2>一、核心重难点</h2>
`;

  analysis.keyDifficulties.forEach((item) => {
    const color = difficultyColors[item.level];
    html += `
  <div class="difficulty-card" style="border-left-color: ${color}">
    <h3>${item.name} <span class="difficulty-level" style="background-color: ${color}">${difficultyLabels[item.level]}</span></h3>
    <p><strong>难点描述：</strong>${item.description}</p>
    <div class="solution">
      <strong>✅ 解决方案：</strong>${item.solution}
    </div>
  </div>`;
  });

  html += `
  <h2>二、常见错误分析</h2>
`;

  analysis.commonMistakes.forEach((mistake) => {
    html += `
  <div class="mistake-card">
    <h3>❌ ${mistake.mistake}</h3>
    <p><strong>正确做法：</strong>${mistake.correctAnswer}</p>
    <p><em>${mistake.explanation}</em></p>
  </div>`;
  });

  html += `
  <h2>三、教学建议</h2>
  <div class="suggestion-list">
    <ol>
      ${analysis.teachingSuggestions.map(s => `<li>${s}</li>`).join('\n      ')}
    </ol>
  </div>

</body>
</html>`;

  return html;
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function htmlToBlob(html: string, type: 'word' | 'pdf'): Blob {
  if (type === 'word') {
    const prehtml = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>Export Document</title></head><body>';
    const posthtml = '</body></html>';
    return new Blob([prehtml + html + posthtml], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });
  }

  return new Blob([html], { type: 'application/pdf' });
}

export const exportService = {
  async exportToWord(
    data: LessonPlan | ExerciseSet | TeachingScript | DifficultyAnalysis,
    filename?: string,
    options?: Partial<ExportOptions>
  ): Promise<void> {
    const mergedOptions = { ...defaultOptions, ...options };
    let html: string;
    let defaultName: string;

    if ('objectives' in data) {
      html = generateWordContent(data as LessonPlan, mergedOptions);
      defaultName = `${data.topic}_教学设计.doc`;
    } else if ('exercises' in data) {
      html = generateExerciseContent(data as ExerciseSet, mergedOptions);
      defaultName = `${data.topic}_练习题.doc`;
    } else if ('sections' in data) {
      html = generateScriptContent(data as TeachingScript, mergedOptions);
      defaultName = `${data.topic}_讲解脚本.doc`;
    } else {
      html = generateAnalysisContent(data as DifficultyAnalysis, mergedOptions);
      defaultName = `${(data as DifficultyAnalysis).topic}_重难点分析.doc`;
    }

    const blob = htmlToBlob(html, 'word');
    downloadBlob(blob, filename || defaultName);
  },

  async exportToPDF(
    data: LessonPlan | ExerciseSet | TeachingScript | DifficultyAnalysis,
    filename?: string,
    options?: Partial<ExportOptions>
  ): Promise<void> {
    const mergedOptions = { ...defaultOptions, ...options };
    let html: string;
    let defaultName: string;

    if ('objectives' in data) {
      html = generateWordContent(data as LessonPlan, mergedOptions);
      defaultName = `${data.topic}_教学设计.pdf`;
    } else if ('exercises' in data) {
      html = generateExerciseContent(data as ExerciseSet, mergedOptions);
      defaultName = `${data.topic}_练习题.pdf`;
    } else if ('sections' in data) {
      html = generateScriptContent(data as TeachingScript, mergedOptions);
      defaultName = `${data.topic}_讲解脚本.pdf`;
    } else {
      html = generateAnalysisContent(data as DifficultyAnalysis, mergedOptions);
      defaultName = `${(data as DifficultyAnalysis).topic}_重难点分析.pdf`;
    }

    printContent(html);

    const blob = new Blob([html], { type: 'text/html' });
    downloadBlob(blob, filename || defaultName);
  },

  downloadBlob
};

export const exportToWord = exportService.exportToWord.bind(exportService);
export const exportToPDF = exportService.exportToPDF.bind(exportService);
export { downloadBlob };

function printContent(html: string): void {
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  }
}
