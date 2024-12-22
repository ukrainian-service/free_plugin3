(function () {
    'use strict';

    function createFreePlugin() {
        const sources = [
            {
                name: 'Eneyida',
                url: 'https://eneyida.tv/?do=search',
                parser: function (query) {
                    return `${this.url}&q=${encodeURIComponent(query)}`;
                }
            },
            {
                name: 'UAKino',
                url: 'https://uakino.me/',
                parser: function (query) {
                    return `${this.url}search/?q=${encodeURIComponent(query)}`;
                }
            },
            {
                name: 'GidOnline',
                url: 'https://gidonline.net/',
                parser: function (query) {
                    return `${this.url}index.php?do=search&subaction=search&q=${encodeURIComponent(query)}`;
                }
            }
        ];

        // Регістрація плагіна
        Lampa.Plugins.register('free_plugin', function () {
            this.create = function () {
                this.activity.loader(true); // Показуємо індикатор завантаження
                const query = this.activity.query; // Отримуємо запит від користувача
                const searchResults = []; // Масив для зберігання результатів пошуку

                let completedRequests = 0;
                sources.forEach(source => {
                    const url = source.parser(query); // Формуємо URL для кожного джерела
                    Lampa.Network.silent(url, (response) => {
                        searchResults.push({
                            source: source.name,
                            url,
                            content: response // Зберігаємо відповідь від джерела
                        });
                        completedRequests++;
                        if (completedRequests === sources.length) {
                            this.showResults(searchResults); // Показуємо результати після отримання всіх відповідей
                        }
                    }, () => {
                        completedRequests++;
                        if (completedRequests === sources.length) {
                            this.showResults(searchResults); // Показуємо результати, якщо є помилка в запиті
                        }
                    });
                });
            };

            this.showResults = function (results) {
                this.activity.loader(false); // Приховуємо індикатор завантаження
                if (results.length === 0) {
                    Lampa.Noty.show('Результати не знайдені.'); // Повідомлення про відсутність результатів
                    return;
                }

                results.forEach(result => {
                    const item = Lampa.Template.get('button', {
                        title: `${result.source} - Перейти`,
                        description: result.url
                    });

                    item.on('hover:enter', () => {
                        Lampa.Platform.openURL(result.url); // Відкриваємо URL в браузері
                    });

                    this.append(item); // Додаємо елемент до інтерфейсу
                });
            };
        });
    }

    createFreePlugin(); // Створюємо плагін
})();
