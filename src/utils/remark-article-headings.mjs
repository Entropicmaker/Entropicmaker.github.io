// The page template owns h1. Preserve article text while normalizing its outline.
export default function remarkArticleHeadings() {
  return (tree, file) => {
    const textOf = (node) => node.value ?? (node.children ?? []).map(textOf).join('');
    const title = file.data.astro?.frontmatter?.title;
    const first = tree.children.findIndex((node) => !['yaml', 'mdxjsEsm'].includes(node.type));
    const node = tree.children[first];
    if (node?.type === 'heading' && node.depth === 1 && textOf(node).trim() === title?.trim()) {
      tree.children.splice(first, 1);
    }
    const headings = [];
    const collect = (node) => {
      if (node.type === 'heading') headings.push(node);
      node.children?.forEach(collect);
    };
    collect(tree);
    let insidePart = false;
    headings.forEach((heading) => {
      if (heading.depth === 1) insidePart = true;
      if (insidePart) heading.depth = Math.min(6, heading.depth + 1);
    });
  };
}
