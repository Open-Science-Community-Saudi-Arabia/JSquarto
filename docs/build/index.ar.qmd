# مرحبا بكم في وثائق JSQuarto

## حول

JSQuarto هي أداة مصممة لتوليد وثائق مرجعية لحزمة API جافا سكريبت باستخدام Markdown و Quarto. يعمل كبديل لـ JSDoc، ويوفر نهجا أبسط وأكثر مرونة لتوثيق شفرة جافا سكريبت.

## الغرض

الغرض من JSQuarto هو تبسيط عملية إنشاء وثائق API المرجعية لحزم جافا سكريبت. من خلال الاستفادة من Markdown و Quarto، يمكن للمطورين إنشاء وحفظ وثائق شاملة لمشاريع جافا سكريبت الخاصة بهم.

## إلهام

JSQuarto يستلهم من أدوات ومنهجيات التوثيق المختلفة، بما في ذلك:  </br>

- [JSDoc](https://jsdoc.app/): JSDoc هو أداة شائعة لتوليد وثائق API من كود مصدر جافا سكريبت. </br>
- [Quarto](https://quarto.org/): Quarto هي أداة مؤلفة ونشر وثيقة متنوعة تدعم تنسيقات Markdown, LaTeX, and R Markdown. </br>
- [Sphinx](https://www.sphinx-doc.org/): Sphinx هو أداة لتوليد الوثائق تستخدم على نطاق واسع في مجتمع Python. </br>

## التعريب والترجمة

وشركة JSQuarto ملتزمة بدعم توطين وترجمة الوثائق التي تم إنشاؤها. نحن نخطط لدمج كراودن، وهي منصة لإدارة التعريب ، لتسهيل جهود الترجمة. وهذا سيمكن المستخدمين من تقديم ملفات QMD التي تم إنشاؤها بلغات متعددة، مما يجعل الوثائق متاحة لجمهور أوسع.

## بدء العمل

#### Prerequisites

قبل اختبار الأداة محلياً، تأكد من وجود الشروط المسبقة التالية مثبتة على النظام الخاص بك:

- [Quarto](https://quarto.org/)
- [Babel Quarto](https://docs.ropensci.org/babelquarto/)
- Node.js and npm (Node Package Manager)

#### Installation

لاختبار الأداة محلياً، قم باتباع الخطوات التالية:

1. Install the tool by running the command below

   ```bash
   npm install -g @oscsa/jsquarto  
   ```

### Usage

Once the dependencies are installed, you can navigate to the root directory of your project and follow the steps below:

1. لإنشاء الوثائق قم بتشغيل الأمر التالي

   ```bash
   jsq doc:generate source=<path to source files> 
   ```

   هذا سوف يستخرج تعليقات JSDoc من ملفات js و يكتبها إلى ملفات Quarto Markdown المقابلة.

   If the `source` flag is not provided, the tool will set `/source_files` as default.

   The generated `.qmd` files can be found in the `/docs` folder, you can change the output directory by providing the `output` flag.

2. لمعاينة الوثائق التي تم إنشاؤها قيد التشغيل

   ```bash
   jsq doc:preview
   ```

   سيؤدي هذا إلى إنشاء الوثائق، ومعاينة مع quarto وفتح رابط لمعاينة المستندات

3. The generated `.qmd` files can be found in the `/docs` folder, you can change the output directory by providing the `output` flag.

   ```bash
   jsq doc:generate source=<path to source files> output=<path to output dir>
   ```

4. To include tutorials in the generated documentation, provide the `tutorials` flag.

   ```bash
   jsq doc:generate source=<path to source files> tutorials=<path to tutorials directory>
   ```

For more information on how to integrate translation tools like Crowdin with JSquarto, refer to the [Crowding workflow guide](https://jsquarto.netlify.app/chapters/tutorials/how_to/workflows#doc-generation-with-crowdin-translation).

For more details on using JSquarto and to see an example of the generated documentation, visit the [JSQuarto documentation](https://jsquarto.netlify.app/)

## المنظمة المساهمة

تم تطوير وصيانة JSQuarto من قبل [المجتمع العلمي المفتوح في المملكة العربية السعودية] (https://github.com/Open-Science-Community-Saudi-Arabia). وتتمثل مهمتنا في تعزيز الممارسات العلمية المفتوحة وتعزيز التعاون بين الباحثين والمطورين في المملكة العربية السعودية.

## الملاحظات والدعم

إذا كان لديك أي أسئلة، أو ردود فعل، أو تحتاج إلى دعم، يرجى [فتح مشكلة] (https://github.com/Open-Science-Community-Saudi-Arabia/JSquarto/issues) على GitHub أو [الانضمام إلى مجتمعنا](https://github.com/Open-Science-Community-Saudi-Arabia) للحصول على المساعدة.
