<h2>Работа в Lambda</h2>

<b>Connect to AWS</b>
<br>
URL: https://564925824098.signin.aws.amazon.com/console
<br>
User ID: pdf-preview-gen-tester2
<br>
Пароль вышлю отдельно.
<br>

Input Basket: <pre>input1.pdf-preview-gen</pre>
Output Basket: <pre>output.pdf-preview-gen</pre>
Table in DynamoDB: <pre>pdf-previews</pre>
Lambda function:
<pre>
pdf-preview-gen
</pre>

Теперь работает и на ламбде.
Напишите, нужна ли инструкция по деплою проекта на ламбду на другой аккаунт.


<h2>Установка для локального тестирования</h2>

Загрузить исходники в отдельную папку.
Запустить в папке установку пакетов:
<pre>npm install</pre>
запуск:
<pre>node index.js</pre>

Для коннекта к AWS нужен файл config.json в корневой папке, вышлю отдельно.

Локально работает на Windows и должно работать на macOS.


Если будете использовать свой аккаунт для тестирования, нужно создать два баскета
и таблицу в DynamoDB (pdf-previews, key: ID (String)), сделать пользователя,
дать ему полный доступ к S3 и DynamoDB, записать его инфу в config.json вида:
<pre>
{
  "accessKeyId": "указать",
  "secretAccessKey": "указать",
  "region": "us-east-2"
}
</pre>
положить в корень.

<s>Заставить работать на Lambda пока не удалось, хотя изначально задумывал так.
Не работает конвертация PDF, вероятно из-за того, что не находит какие-то
нативные библиотеки.

<b>UPD</b>

Что-то поменялось в Lambda окруженнии за последнии несколько недель,
как я понял удалили ImageMagick из установки поумолчанию.
Примеры и библиотеки, которые удалось найти не работают.

Пробовал устанавливать ImageMagick и Ghostsctript вручную, как леера для ламбды.
Успех только частичный - устанавливается, но работает не до конца.
Честно говоря, убил на это больше времени, чем на программирование.

Если принципиально, могу на выходных добить.

</s>


<s>
<b>Известные мне проблемы</b>

Поскольку рассчитывал на S3 триггер, в тестовом локальном режиме не производится
поиск новых файлов в баскете, а берется один указанный файл для тестирования.
Могу или переделать это или все-таки заставить его работать на ламбде с S3 триггером,
как и задумывалось (собственно это работает, не работает только конвертация PDF на
ламбде, остальное я протестировал на ней).

</s>
