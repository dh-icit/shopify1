document.addEventListener("DOMContentLoaded", () => {

    const button = document.querySelector('.wt-cart__cross-sell__toggle');
    if(button) {
        button.addEventListener('click', () => {
        const isExpanded = button.getAttribute('aria-expanded') === 'true';
            button.closest('.wt-cart__cross-sell').classList.toggle('wt-cart__cross-sell--collapsed')
            button.setAttribute('aria-expanded', !isExpanded);
        });
    }

    const input = document.getElementById('search-shop');
    

    let activeIndex = -1; 
    
    input.addEventListener('keydown', (e) => {
        
        const list = document.getElementById('predictive-search-results-list');
        
        if(!list) return;
        const items = list.querySelectorAll('.search-result-list__item');
        if (items.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            input.setAttribute('aria-expanded', 'true');
            activeIndex = (activeIndex + 1) % items.length;
            setActiveItem(items, activeIndex);
        } 
    
        else if (e.key === 'ArrowUp') {
            e.preventDefault();
            activeIndex = (activeIndex - 1 + items.length) % items.length;
            setActiveItem(items, activeIndex);
        } 
    
        else if (e.key === 'Enter') {
            if (activeIndex >= 0 && items[activeIndex]) {
            e.preventDefault();
                const link = items[activeIndex].querySelector('a');
                if (link) link.click();
            }
        } 
        
        else if (e.key === 'Escape') {
            input.setAttribute('aria-expanded', 'false');
            resetActiveItem(items);
        }
    });

    function setActiveItem(items, index) {
    
        items.forEach(item => item.classList.remove('is-active'));
    
        const currentItem = items[index];
        currentItem.classList.add('is-active');
        currentItem.scrollIntoView({ block: 'nearest' });
        input.setAttribute('aria-activedescendant', currentItem.id);
    }

    function resetActiveItem(items) {
        items.forEach(item => item.classList.remove('is-active'));
        activeIndex = -1;
        input.removeAttribute('aria-activedescendant');
    }

    input.addEventListener('input', () => {
        activeIndex = -1;
        input.setAttribute('aria-expanded', 'true');
    });

});