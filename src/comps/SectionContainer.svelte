<script>
    let props = $props();
</script>

<div id={props.id} class="h-screen bg-base-100 grid items-center align-middle snap-start px-8 py-16">
    <slot></slot>
</div>