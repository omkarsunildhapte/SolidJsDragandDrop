import { createEffect, createSignal, onCleanup } from 'solid-js';
import './TreeComponent.css';
import { getData, getEmptyData } from './data';

interface TreeNode {
    header: string;
    items?: TreeNode[];
    isCollapsed?: boolean;
}

type FoundItemResult = { found: TreeNode; parent: TreeNode[] } | null;

const TreeComponent = () => {
    const [firstTreeData, setFirstTreeData] = createSignal(getData());
    const [secondTreeData, setSecondTreeData] = createSignal(getEmptyData());
    const [dragAndDropInitialized, setDragAndDropInitialized] = createSignal(false);

    createEffect(() => {
        const firstTreeHost = document.getElementById('firstTree');
        const secondTreeHost = document.getElementById('secondTree');
        if (firstTreeHost && secondTreeHost && !dragAndDropInitialized()) {
            renderTree(firstTreeHost, firstTreeData, 'firstTree');
            renderTree(secondTreeHost, secondTreeData, 'secondTree');

            attachDragAndDrop(firstTreeHost, 'firstTree');
            attachDragAndDrop(secondTreeHost, 'secondTree');

            setDragAndDropInitialized(true);
        }
        onCleanup(() => { });
    });

    function renderTree(treeHost: HTMLElement, treeDataSignal: any, treeId: string) {
        const treeData = treeDataSignal();
        treeHost.innerHTML = createTreeHTML(treeData, treeId);
    }

    function createTreeHTML(data: TreeNode[], treeId: string): string {
        return `<ul>${data.map((item) => createTreeNodeHTML(item, treeId)).join('')}</ul>`;
    }

    function createTreeNodeHTML(item: TreeNode, treeId: string): string {
        return `
      <li draggable="true">
        <span class="tree-node" onclick="window.toggleExpandCollapse('${item.header}', '${treeId}')">
          ${item.header}
        </span>
        ${item.items && !item.isCollapsed ? createTreeHTML(item.items, treeId) : ''}
      </li>
    `;
    }

    function attachDragAndDrop(treeHost: HTMLElement, treeId: string) {
        treeHost.addEventListener('dragstart', (e) => {
            const target = e.target as HTMLElement;
            if (target.tagName === 'LI' && e.dataTransfer) {
                e.dataTransfer.setData('text/plain', target.innerHTML);
                e.dataTransfer.effectAllowed = 'move';
            }
        });

        treeHost.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (e.dataTransfer) {
                e.dataTransfer.dropEffect = 'move';
            }
        });

        treeHost.addEventListener('drop', (e) => {
            e.preventDefault();
            const target = e.target as HTMLElement;
            const draggedHTML = e.dataTransfer?.getData('text/plain');
            if (!draggedHTML) {
                return;
            }
            const draggedItem = parseHTML(draggedHTML);
            const cleanedHeader = draggedItem.header.trim();
            const sourceTreeData = treeId === 'firstTree' ? firstTreeData : secondTreeData;
            const newTreeData = [...sourceTreeData()];
            const result = findItem(newTreeData, target.textContent?.trim() || '');

            debugger
            if (result && result.parent !== undefined) {
                if (result.found.header.includes(cleanedHeader.replace(/\s\d+(\.\d+)?$/, '').trim())) {
                    result.parent.push({ header: cleanedHeader });
                    debugger
                    const updatedSourceTreeData = sourceTreeData().map(e => ({ header: e.header, items: e.items.filter(m => m.header !== cleanedHeader) }));
                    if (treeId === 'firstTree') {
                        setSecondTreeData(updatedSourceTreeData);
                    } else {
                        setFirstTreeData(updatedSourceTreeData);
                    }
                } else {
                    alert('can not make drop here')
                }
            } else { }
            renderTree(document.getElementById(treeId)!, treeId === 'firstTree' ? firstTreeData : secondTreeData, treeId);
        });
    }

    function findItem(items: TreeNode[], header: string, parent: TreeNode[] = []): FoundItemResult {
        for (const item of items) {
            if (item.header.trim() === header.trim()) {
                return { found: item, parent };
            } else if (item.items) {
                const foundInChild = findItem(item.items, header, item.items);
                if (foundInChild) {
                    return foundInChild;
                }
            }
        }
        return null;
    }

    function parseHTML(html: string): TreeNode {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        return {
            header: tempDiv.textContent || '',
        };
    }

    return (
        <div>
            <h2>Tree Component</h2>

            <div>
                <h3>First Tree</h3>
                <div id="firstTree"></div>
            </div>

            <div>
                <h3>Second Tree</h3>
                <div id="secondTree"></div>
            </div>
        </div>
    );
};

export default TreeComponent;
